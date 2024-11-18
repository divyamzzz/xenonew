import React from 'react';

const Login = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google'; 
    };

    return (
        <div className="login-container">
            <h1>XENO MINI CRM</h1>
            <button onClick={handleLogin} className="btn btn-primary">
                Login with Google
            </button>
        </div>
    );
};

export default Login;
