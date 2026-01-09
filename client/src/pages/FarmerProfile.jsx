import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FarmerProfile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address
    });
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/api/users/${user.id}`, formData);
            updateUser(res.data.user);
            setMsg('Profile updated successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('Error updating profile');
        }
    };

    return (
        <div className="profile-page fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>My Profile</h2>
            {msg && <div className="alert" style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>{msg}</div>}

            <form onSubmit={handleSubmit} className="card">
                <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" className="input-field" value={formData.email} disabled style={{ background: '#f9f9f9', cursor: 'not-allowed' }} />
                </div>
                <div className="input-group">
                    <label>Mobile</label>
                    <input type="text" className="input-field" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Addresss</label>
                    <input type="text" className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <button className="btn btn-primary">Save Changes</button>
            </form>
        </div>
    );
};

export default FarmerProfile;
