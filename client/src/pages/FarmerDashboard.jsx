import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FarmerProfile from './FarmerProfile';
import FarmerListings from './FarmerListings';
import { BarChart, DollarSign, Star, Package } from 'lucide-react';
import './FarmerDashboard.css';

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = React.useState({
        monthlyRevenue: 0,
        monthlySales: 0,
        totalRevenue: user.revenue || 0,
        totalSales: user.sales || 0
    });

    React.useEffect(() => {
        // Fetch fresh stats from backend
        // Assuming we have axios available, otherwise fetch
        // Note: axios is not imported in this file in original view
        // Adding import assumes I can add it, but this is replace block inside function.
        // Let's use fetch API to avoid missing import issues or assume axios is globally available/imported
        // But better to import axios at top level if managing top level lines is easy.
        // Since I'm only replacing this block, I should probably use `fetch` or assume axios.
        // Wait, looking at file content, axios is NOT imported.
        // I will use fetch.

        const fetchStats = async () => {
            try {
                const response = await fetch(`https://farmdirect-2.onrender.com/api/farmer/stats/${user.id}`);
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };

        if (user.id) {
            fetchStats();
        }
    }, [user.id]);


    return (
        <div className="dashboard-home fade-in">
            <h2>Welcome back, {user.name}</h2>

            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#e0f7fa', color: '#00bcd4' }}><DollarSign /></div>
                    <div className="stat-info">
                        <h3>₹{stats.totalRevenue ? stats.totalRevenue.toFixed(2) : 0}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#e0f7fa', color: '#00838f' }}><DollarSign /></div>
                    <div className="stat-info">
                        <h3>₹{stats.monthlyRevenue ? stats.monthlyRevenue.toFixed(2) : 0}</h3>
                        <p>Monthly Revenue</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}><Package /></div>
                    <div className="stat-info">
                        <h3>{stats.totalSales || 0}</h3>
                        <p>Total Sales (Qty)</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}><Package /></div>
                    <div className="stat-info">
                        <h3>{stats.monthlySales || 0}</h3>
                        <p>Monthly Sales (Qty)</p>
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
