const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pg = require('pg');
const env = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const app = express();
env.config();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());


const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection error:', err.stack));


passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:5000/auth/google/dashboard',
            userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const email = profile.emails[0].value;

                const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

                if (result.rows.length === 0) {
                    // Insert new user
                    const newUser = await db.query(
                        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
                        [email, 'google']
                    );
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                console.error('Error during Google OAuth:', err);
                return cb(err);
            }
        }
    )
);

app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

app.get(
    '/auth/google/dashboard',
    passport.authenticate('google', {
        successRedirect: 'http://localhost:3000/dashboard',
        failureRedirect: 'http://localhost:3000/home',
    })
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('http://localhost:3000/');
    });
});


app.post('/api/customers', async (req, res) => {
    const { name, email, total_spending, visits, last_visit } = req.body;
    try {
        const query = `
            INSERT INTO customers (name, email, total_spending, visits, last_visit)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await db.query(query, [name, email, total_spending, visits, last_visit]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/orders', async (req, res) => {
    const { customer_id, order_amount, order_date } = req.body;
    try {
        const query = `
            INSERT INTO orders (customer_id, order_amount, order_date)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [customer_id, order_amount, order_date];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/campaigns', async (req, res) => {
    const { name, audience_size } = req.body;
    try {
        const query = `
            INSERT INTO campaigns (name, audience_size)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await db.query(query, [name, audience_size]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.post('/api/send-messages', async (req, res) => {
    const { campaign_id, audience } = req.body;

    if (!campaign_id || !Array.isArray(audience) || audience.length === 0) {
        return res.status(400).json({ error: 'Invalid campaign or audience data.' });
    }

    try {
        const messages = audience.map(async (customer) => {
            const personalizedMessage = `Hi ${customer.name}, here’s 10% off on your next order!`;

            
            const query = `
                INSERT INTO communication_log (campaign_id, customer_id, status)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const randomStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED'; 
            const result = await db.query(query, [campaign_id, customer.id, randomStatus]);

            
            await axios.post('http://localhost:5000/api/delivery-receipt', {
                log_id: result.rows[0].id,
                status: randomStatus,
            });

            return result.rows[0];
        });

        const sentMessages = await Promise.all(messages);
        res.status(200).json({ success: true, messages: sentMessages });
    } catch (error) {
        console.error('Error sending messages:', error.message);
        res.status(500).json({ error: 'An error occurred while sending messages.' });
    }
});


app.post('/api/delivery-receipt', async (req, res) => {
    const { log_id, status } = req.body;

    if (!log_id || !status) {
        return res.status(400).json({ error: 'Invalid log ID or status.' });
    }

    try {
        const query = `
            UPDATE communication_log
            SET status = $1
            WHERE id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [status, log_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Log ID not found.' });
        }

        res.status(200).json({ success: true, updatedLog: result.rows[0] });
    } catch (error) {
        console.error('Error updating delivery receipt:', error.message);
        res.status(500).json({ error: 'An error occurred while updating delivery receipt.' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                campaigns.name AS campaign_name,
                COUNT(communication_log.id) AS total_messages,
                SUM(CASE WHEN communication_log.status = 'SENT' THEN 1 ELSE 0 END) AS sent,
                SUM(CASE WHEN communication_log.status = 'FAILED' THEN 1 ELSE 0 END) AS failed,
                MAX(audience_size) AS audience_size
            FROM communication_log
            INNER JOIN campaigns ON communication_log.campaign_id = campaigns.id
            GROUP BY campaigns.id, campaigns.name
            ORDER BY campaigns.name;
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching campaign stats:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching campaign stats.' });
    }
});
app.post('/api/audience/calculate', async (req, res) => {
    const { conditions } = req.body;

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
        return res.status(400).json({ error: 'Invalid conditions format or no conditions provided' });
    }

    try {
        const whereClauses = [];
        const values = [];

        conditions.forEach((condition, index) => {
            const { field, operator, value, logic } = condition;

            if (!field || !operator || value === undefined) {
                throw new Error('Invalid condition structure');
            }

            
            const clause = `${index > 0 ? `${logic} ` : ''}${field} ${operator} $${index + 1}`;
            whereClauses.push(clause);
            values.push(value);
        });

        const query = `
            SELECT COUNT(*) AS audience_size
            FROM customers
            WHERE ${whereClauses.join(' ')};
        `;

        const result = await db.query(query, values);

        res.status(200).json({ audience_size: result.rows[0].audience_size });
    } catch (error) {
        console.error('Error calculating audience size:', error.message);
        res.status(500).json({ error: 'An error occurred while calculating audience size' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
