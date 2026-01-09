import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FarmerProfile from './FarmerProfile';
import FarmerListings from './FarmerListings';
import { BarChart, DollarSign, Star, Package } from 'lucide-react';
import './FarmerDashboard.css';

const DashboardHome = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-home fade-in">
            <h2>Welcome back, {user.name}</h2>

            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#e0f7fa', color: '#00bcd4' }}><DollarSign /></div>
                    <div className="stat-info">
                        <h3>₹{user.revenue || 0}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}><Package /></div>
                    <div className="stat-info">
                        <h3>{user.sales || 0}</h3>
                        <p>Total Sales (Qty)</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#fff8e1', color: '#ffc107' }}><Star /></div>
                    <div className="stat-info">
                        <h3>{user.ratings || 0}/5</h3>
                        <p>Rating</p>
                    </div>
                </div>
            </div>

            <div className="actions-section">
                <h3>Quick Actions</h3>
                <Link to="/farmer/listings" className="btn btn-primary">Manage Listings</Link>
                <Link to="/farmer/profile" className="btn btn-outline" style={{ marginLeft: '20px' }}>Edit Profile</Link>
            </div>
        </div>
    );
};

const FarmerDashboard = () => {
    return (
        <div className="farmer-dashboard container">
            <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/profile" element={<FarmerProfile />} />
                <Route path="/listings" element={<FarmerListings />} />
            </Routes>
        </div>
    );
};

export default FarmerDashboard;
