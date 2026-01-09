import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header className="hero-section">
                <div className="hero-content fade-in">
                    <h1>Direct form the <span className="highlight">Farm</span> to your <span className="highlight">Table</span></h1>
                    <p>Experience the freshest produce delivered directly from local farmers. No middlemen, just fair prices and premium quality.</p>
                    <div className="hero-actions">
                        <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
                        <Link to="/login" className="btn btn-outline btn-lg" style={{ marginLeft: '15px' }}>Login</Link>
                    </div>
                </div>
                <div className="hero-image fade-in">
                    {/* Placeholder for a nice illustration. Using CSS shapes for now */}
                    <div className="circle-bg"></div>
                    <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Fresh Vegetables" className="hero-img glass" />
                </div>
            </header>

            <section className="features container">
                <div className="feature-card card">
                    <h3>For Consumers</h3>
                    <p>Access fresh, organic produce at lower prices by buying directly from the source.</p>
                </div>
                <div className="feature-card card">
                    <h3>For Farmers</h3>
                    <p>Get fair compensation for your hard work by eliminating intermediate cuts.</p>
                </div>
                <div className="feature-card card">
                    <h3>Trustworthy</h3>
                    <p>Verified profiles and transparent pricing ensure a safe marketplace for everyone.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
