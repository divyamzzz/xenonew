import React, { useState } from 'react';
import axios from 'axios';

function CustomerForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        total_spending: '',
        visits: '',
        last_visit: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/customers`, formData);
            alert('Customer added successfully: ' + JSON.stringify(response.data));
        } catch (error) {
            alert('Error adding customer: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Add Customer</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="number" name="total_spending" placeholder="Total Spending" onChange={handleChange} />
                <input type="number" name="visits" placeholder="Visits" onChange={handleChange} />
                <input type="date" name="last_visit" onChange={handleChange} />
                <button type="submit">Add Customer</button>
            </form>
        </div>
    );
}

export default CustomerForm;
