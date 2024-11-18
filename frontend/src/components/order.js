import React, { useState } from 'react';
import axios from 'axios';

function OrderForm() {
    const [formData, setFormData] = useState({
        customer_id: '',
        order_amount: '',
        order_date: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, formData);
            alert('Order added successfully: ' + JSON.stringify(response.data));
        } catch (error) {
            alert('Error adding order: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Add Order</h2>
            <form onSubmit={handleSubmit}>
                <input type="number" name="customer_id" placeholder="Customer ID" onChange={handleChange} required />
                <input type="number" name="order_amount" placeholder="Order Amount" onChange={handleChange} required />
                <input type="date" name="order_date" onChange={handleChange} />
                <button type="submit">Add Order</button>
            </form>
        </div>
    );
}

export default OrderForm;
