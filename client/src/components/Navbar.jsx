import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-container">
                <Link to="/" className="logo">
                    Farm<span className="accent">Direct</span>
                </Link>

                {/* Desktop Menu */}
                <div className="nav-links">
                    {!user ? (
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/login" className="btn btn-outline" style={{ marginRight: '10px' }}>Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </>
                    ) : (
                        <>
                            {user.role === 'consumer' && (
                                <>
                                    <Link to="/marketplace" className="nav-link">Marketplace</Link>
                                    <Link to="/cart" className="nav-link cart-icon">
                                        <ShoppingCart size={20} />
                                        {cart.length > 0 && <span className="badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                                    </Link>
                                </>
                            )}

                            {user.role === 'farmer' && (
                                <>
                                    <Link to="/farmer/dashboard" className="nav-link">Dashboard</Link>
                                    <Link to="/farmer/listings" className="nav-link">My Listings</Link>
                                </>
                            )}

                            <div className="profile-menu">
                                <div className="nav-link" onClick={() => navigate(user.role === 'farmer' ? '/farmer/profile' : '/marketplace')}>
                                    <User size={20} />
                                    <span style={{ marginLeft: '5px' }}>{user.name}</span>
                                </div>
                                <button onClick={handleLogout} className="btn-icon" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
