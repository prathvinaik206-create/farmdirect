import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Calculate Fees
    const hasHighValueItem = cart.some(item => item.price > 100);
    const platformFee = hasHighValueItem ? total * 0.05 : 0;
    const finalTotal = total + platformFee;

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            // Transform cart to order items structure
            const orderItems = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            await axios.post('https://farmdirect-2.onrender.com/api/orders', {
                consumerId: user.id,
                items: orderItems,
                totalAmount: finalTotal
            });

            setOrderSuccess(true);
            setTimeout(() => {
                clearCart();
                setOrderSuccess(false);
                setIsCheckingOut(false);
                navigate('/marketplace');
            }, 3000);

        } catch (err) {
            alert("Checkout failed. Please try again.");
            setIsCheckingOut(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
                <div className="card glass" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h2 style={{ color: 'var(--primary-color)' }}>Order Placed Successfully!</h2>
                    <p>Thank you for supporting local farmers.</p>
                    <p>Redirecting to marketplace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '30px 0' }}>
            <h2>Your Cart</h2>

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
                    <p>Your cart is empty.</p>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/marketplace')}>
                        Browse Marketplace
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '30px', marginTop: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        {cart.map(item => (
                            <div key={item.id} className="card" style={{ display: 'flex', marginBottom: '20px', alignItems: 'center', padding: '15px' }}>
                                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ marginLeft: '20px', flex: 1 }}>
                                    <h4>{item.name}</h4>
                                    <p style={{ color: '#888' }}>₹{item.price} / {item.unit}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button className="btn-icon" onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                                    <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                    <button className="btn-icon" onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                                </div>
                                <div style={{ marginLeft: '20px', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button className="btn-icon" style={{ color: 'var(--danger-color)', marginLeft: '15px' }} onClick={() => removeFromCart(item.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div className="card glass" style={{ position: 'sticky', top: '100px' }}>
                            <h3>Order Summary</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                                <span>Subtotal</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                                <span>Platform Fee {hasHighValueItem && '(5%)'}</span>
                                <span>₹{platformFee.toFixed(2)}</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                <span>Total</span>
                                <span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? 'Processing...' : 'Checkout / Buy Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
