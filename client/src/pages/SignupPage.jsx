import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; // Shared styles for auth pages

const SignupPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('consumer');
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        username: '',
        password: '',
        address: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('https://farmdirect-2.onrender.com/api/auth/signup', { ...formData, role });
            const user = res.data.user;
            login(user);
            navigate(role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass card">
                <h2>Create Account</h2>

                {/* Role Toggles */}
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
                        <input type="text" name="name" placeholder="Full Name" className="input-field" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="text" name="mobile" placeholder="Mobile Number" className="input-field" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="email" name="email" placeholder="Email Address" className="input-field" onChange={handleChange} required />
                    </div>
                    {/* Address is optional for consumer but critical for farmer */}
                    <div className="input-group">
                        <input type="text" name="address" placeholder="Address / Area" className="input-field" onChange={handleChange} required={role === 'farmer'} />
                    </div>
                    <div className="input-group">
                        <input type="text" name="username" placeholder="Username" className="input-field" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign Up</button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="accent-link">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
