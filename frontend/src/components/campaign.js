import React, { useState } from 'react';
import axios from 'axios';

function CampaignForm() {
    const [formData, setFormData] = useState({
        name: '',
        audience_size: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/campaigns`, formData);
            alert('Campaign added successfully: ' + JSON.stringify(response.data));
        } catch (error) {
            alert('Error adding campaign: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Add Campaign</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Campaign Name" onChange={handleChange} required />
                <input type="number" name="audience_size" placeholder="Audience Size" onChange={handleChange} required />
                <button type="submit">Add Campaign</button>
            </form>
        </div>
    );
}

export default CampaignForm;
