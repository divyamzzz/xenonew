import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Campaigns from './campaign';
import Audience from './Audience';
import Stats from './Stats';
import Message from './message';
import Customer from './customer';
import Order from './order';
import './Dashboard.css'; // Import external CSS file

const Dashboard = () => {
    const handleLogout = () => {
        window.location.href = 'http://localhost:5000/logout';
    };

    return (
        <div>
            <nav>
                <ul className="nav-links">
                    <li><Link to="campaigns">Campaigns</Link></li>
                    <li><Link to="audience">Audience</Link></li>
                    <li><Link to="stats">Stats</Link></li>
                    <li><Link to="order">Order</Link></li>
                    <li><Link to="customer">Customer</Link></li>
                    <li><Link to="message">Message</Link></li>
                    <li>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="content">
                <Routes>
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route path="audience" element={<Audience />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="customer" element={<Customer />} />
                    <Route path="message" element={<Message />} />
                    <Route path="order" element={<Order />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
