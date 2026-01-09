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
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar glass">
            <div className="container navbar-container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    Farm<span className="accent">Direct</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    <Menu size={24} color="var(--primary-dark)" />
                </button>

                {/* Desktop & Mobile Menu Links */}
                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    {!user ? (
                        <>
                            <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                            <Link to="/login" className="btn btn-outline" style={{ marginRight: '10px' }} onClick={closeMenu}>Login</Link>
                            <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>Sign Up</Link>
                        </>
                    ) : (
                        <>
                            {user.role === 'consumer' && (
                                <>
                                    <Link to="/marketplace" className="nav-link" onClick={closeMenu}>Marketplace</Link>
                                    <Link to="/cart" className="nav-link cart-icon" onClick={closeMenu}>
                                        <ShoppingCart size={20} />
                                        <span className="link-text-mobile">Cart</span>
                                        {cart.length > 0 && <span className="badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                                    </Link>
                                </>
                            )}

                            {user.role === 'farmer' && (
                                <>
                                    <Link to="/farmer/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/farmer/listings" className="nav-link" onClick={closeMenu}>My Listings</Link>
                                </>
                            )}

                            <div className="profile-menu">
                                <div className="nav-link" onClick={() => { navigate(user.role === 'farmer' ? '/farmer/profile' : '/consumer/profile'); closeMenu(); }}>
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
