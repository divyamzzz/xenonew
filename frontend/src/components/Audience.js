import React, { useState } from 'react';
import axios from 'axios';

const Audience = () => {
    const [conditions, setConditions] = useState([]);
    const [newCondition, setNewCondition] = useState({ field: '', operator: '', value: '', logic: 'AND' });
    const [audienceSize, setAudienceSize] = useState(null);

    const fields = ['total_spending', 'visits', 'last_visit'];
    const operators = ['>', '<', '>=', '<=', '=', '!='];

    const addCondition = () => {
        if (newCondition.field && newCondition.operator && newCondition.value) {
            setConditions([...conditions, newCondition]);
            setNewCondition({ field: '', operator: '', value: '', logic: 'AND' });
        } else {
            alert('Please fill in all fields for the condition.');
        }
    };

    const calculateAudience = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/audience/calculate', { conditions });
            setAudienceSize(response.data.audience_size);
        } catch (error) {
            console.error('Error calculating audience size:', error);
        }
    };

    return (
        <div>
            <h2>Define Your Audience</h2>
            <div>
                <select
                    value={newCondition.field}
                    onChange={(e) => setNewCondition({ ...newCondition, field: e.target.value })}
                >
                    <option value="">Select Field</option>
                    {fields.map((field) => (
                        <option key={field} value={field}>
                            {field}
                        </option>
                    ))}
                </select>
                <select
                    value={newCondition.operator}
                    onChange={(e) => setNewCondition({ ...newCondition, operator: e.target.value })}
                >
                    <option value="">Select Operator</option>
                    {operators.map((operator) => (
                        <option key={operator} value={operator}>
                            {operator}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Value"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                />
                <select
                    value={newCondition.logic}
                    onChange={(e) => setNewCondition({ ...newCondition, logic: e.target.value })}
                >
                    <option value="AND" >AND</option>
                    <option value="OR">OR</option>
                </select>
                <button onClick={addCondition}>Add Condition</button>
            </div>
            <div>
                <h3>Current Conditions</h3>
                <ul>
                    {conditions.map((condition, index) => (
                        <li key={index}>
                            {condition.logic} {condition.field} {condition.operator} {condition.value}
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={calculateAudience} className="btn btn-primary">
                Calculate Audience Size
            </button>
            {audienceSize !== null && <p>Audience Size: {audienceSize}</p>}
        </div>
    );
};

export default Audience;
