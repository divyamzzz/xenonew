import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Stats = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/stats') 
            .then(response => setStats(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h2>Campaign Stats</h2>
            <ul>
                {stats.map(stat => (
                    <li key={stat.id}>
                        Campaign: {stat.campaign_name} | Sent: {stat.sent} | Failed: {stat.failed}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Stats;
