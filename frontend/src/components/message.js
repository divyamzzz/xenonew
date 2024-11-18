import React, { useState } from 'react';
import axios from 'axios';

function MessageForm() {
    const [campaignId, setCampaignId] = useState('');
    const [audience, setAudience] = useState([{ id: '', name: '' }]);

    
    const handleCampaignChange = (e) => {
        setCampaignId(e.target.value);
    };

  
    const handleAudienceChange = (index, field, value) => {
        const updatedAudience = [...audience];
        updatedAudience[index][field] = value;
        setAudience(updatedAudience);
    };

    
    const addAudienceRow = () => {
        setAudience([...audience, { id: '', name: '' }]);
    };

  
    const removeAudienceRow = (index) => {
        const updatedAudience = [...audience];
        updatedAudience.splice(index, 1);
        setAudience(updatedAudience);
    };

   
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                campaign_id: campaignId,
                audience,
            };
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-messages`, payload);
            alert('Messages sent successfully: ' + JSON.stringify(response.data));
        } catch (error) {
            alert('Error sending messages: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Send Messages</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    name="campaign_id"
                    placeholder="Campaign ID"
                    value={campaignId}
                    onChange={handleCampaignChange}
                    required
                />
                <h3>Audience</h3>
                {audience.map((member, index) => (
                    <div key={index} className="audience-row">
                        <input
                            type="number"
                            placeholder="Customer ID"
                            value={member.id}
                            onChange={(e) => handleAudienceChange(index, 'id', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={member.name}
                            onChange={(e) => handleAudienceChange(index, 'name', e.target.value)}
                            required
                        />
                        {audience.length > 1 && (
                            <button type="button" onClick={() => removeAudienceRow(index)}>
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addAudienceRow}>
                    Add Audience
                </button>
                <button type="submit">Send Messages</button>
            </form>
        </div>
    );
}

export default MessageForm;
