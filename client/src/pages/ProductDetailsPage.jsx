import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, MapPin, User, ChevronLeft } from 'lucide-react';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // In a real app we would have a specific get endpoint, but filtering list works for local JSON
                const res = await axios.get('https://farmdirect-2.onrender.com/api/products');
                const found = res.data.find(p => p.id === id);
                setProduct(found);
            } catch (err) {
                console.error("Error fetching product");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/cart');
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!product) return <div className="container">Product not found</div>;

    return (
        <div className="container fade-in" style={{ padding: '40px 0' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={16} /> Back
            </button>

            <div className="card glass" style={{ display: 'flex', flexDirection: 'row', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '15px', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{product.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#f39c12' }}>
                        <Star fill="#f39c12" size={20} />
                        <Star fill="#f39c12" size={20} />
                        <Star fill="#f39c12" size={20} />
                        <Star fill="#f39c12" size={20} />
                        <Star size={20} />
                        <span style={{ color: '#888', marginLeft: '10px' }}>(4.0 Ratings)</span>
                    </div>

                    <h2 style={{ color: 'var(--primary-dark)', fontSize: '2rem', marginBottom: '20px' }}>
                        ₹{product.price} <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>/ {product.unit}</span>
                    </h2>

                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.8', marginBottom: '30px' }}>
                        {product.description}
                    </p>

                    <div className="farmer-info card" style={{ background: '#f8f9fa', marginBottom: '30px' }}>
                        <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                            <User size={18} style={{ marginRight: '8px' }} /> Seller Details
                        </h4>
                        <p><strong>Name:</strong> {product.farmerName}</p>
                        <p style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                            <MapPin size={16} style={{ marginRight: '5px', color: 'var(--danger-color)' }} />
                            {product.farmerAddress || 'Local Farm'}, Pincode: {product.pincode}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => addToCart(product)}>
                            <ShoppingCart size={18} style={{ marginRight: '8px' }} /> Add to Cart
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBuyNow}>
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
