import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('consumer');
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { ...formData, role });
            login(res.data.user);
            navigate(role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass card">
                <h2>Welcome Back</h2>

                <div className="role-switch">
                    <button
                        className={`role-btn ${role === 'consumer' ? 'active' : ''}`}
                        onClick={() => setRole('consumer')}
                    >
                        Consumer
                    </button>
                    <button
                        className={`role-btn ${role === 'farmer' ? 'active' : ''}`}
                        onClick={() => setRole('farmer')}
                    >
                        Farmer
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" name="username" placeholder="Username" className="input-field" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>

                <p className="auth-footer">
                    New to FarmDirect? <Link to="/signup" className="accent-link">Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
