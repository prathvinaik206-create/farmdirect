import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Trash2, User, Phone, MapPin, Mail } from 'lucide-react';

const ConsumerProfile = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        username: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                address: user.address || '',
                username: user.username || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.put(`https://farmdirect-2.onrender.com/api/users/${user.id}`, formData);
            login(res.data.user); // Update context
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile.');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete your account and cannot be undone.")) {
            try {
                await axios.delete(`https://farmdirect-2.onrender.com/api/users/${user.id}`);
                logout();
                navigate('/');
                alert('Your account has been deleted.');
            } catch (err) {
                console.error(err);
                alert('Failed to delete account.');
            }
        }
    };

    return (
        <div className="container fade-in" style={{ maxWidth: '600px', padding: '40px 20px' }}>
            <div className="card glass">
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User className="text-primary" /> My Profile
                </h2>

                {message && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        backgroundColor: message.includes('Failed') ? '#fee2e2' : '#dcfce7',
                        color: message.includes('Failed') ? '#dc2626' : '#16a34a'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input type="text" name="name" className="input-field" style={{ paddingLeft: '40px' }}
                                value={formData.name} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input type="email" name="email" className="input-field" style={{ paddingLeft: '40px' }}
                                value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input type="text" name="mobile" className="input-field" style={{ paddingLeft: '40px' }}
                                value={formData.mobile} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Address</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input type="text" name="address" className="input-field" style={{ paddingLeft: '40px' }}
                                value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Username (Cannot be changed)</label>
                        <input type="text" className="input-field" value={formData.username} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        <Save size={18} /> Save Changes
                    </button>
                </form>

                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#dc2626', marginBottom: '10px' }}>Danger Zone</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Once you delete your account, there is no going back. Please be certain.</p>
                    <button type="button" onClick={handleDeleteAccount} className="btn" style={{
                        width: '100%',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                    }}>
                        <Trash2 size={18} /> Delete My Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsumerProfile;
