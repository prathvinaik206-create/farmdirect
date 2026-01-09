import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ConsumerMarketplace.css';

const ConsumerMarketplace = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const { addToCart } = useCart();
    const [notification, setNotification] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortBy === 'price-low') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(result);
    }, [products, searchTerm, sortBy]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('https://farmdirect-2.onrender.com/api/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products");
        }
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation(); // Prevent navigation when clicking Add to Cart
        addToCart(product);
        setNotification(`Added ${product.name} to cart!`);
        setTimeout(() => setNotification(''), 2000);
    };

    return (
        <div className="marketplace container fade-in">
            <div className="marketplace-header">
                <h2>Fresh from Farm</h2>
                <div className="controls">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search fresh produce..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="sort-box">
                        <Filter size={18} />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="name">Sort by Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {notification && <div className="toast-notification">{notification}</div>}

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card card" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="product-image-container">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <span className="location-tag">{product.pincode}</span>
                        </div>
                        <div className="product-details">
                            <h3>{product.name}</h3>
                            <p className="farmer-name">By {product.farmerName}</p>
                            <p className="description">{product.description}</p>
                            <div className="price-row">
                                <span className="price">₹{product.price}<small>/{product.unit}</small></span>
                                <button className="btn btn-primary btn-sm" onClick={(e) => handleAddToCart(e, product)}>
                                    <ShoppingCart size={16} /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="no-results">
                    <p>No products found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default ConsumerMarketplace;
