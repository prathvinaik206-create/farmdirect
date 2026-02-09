import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, Package, X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ onClose, onConfirm, totalAmount }) => {
    const [method, setMethod] = useState('card'); // card, upi, cod
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Simulate a small delay for "processing"
        setTimeout(() => {
            onConfirm(method);
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-900">Complete Payment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-slate-500 font-medium mb-1">You are about to pay</p>
                        <h2 className="text-4xl font-black text-primary">₹{totalAmount.toFixed(2)}</h2>
                    </div>

                    <div className="space-y-3 mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Payment Method</p>

                        {/* Card Option */}
                        <button
                            onClick={() => setMethod('card')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${method === 'card' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className={`p-3 rounded-xl ${method === 'card' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <CreditCard size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900">Credit / Debit Card</p>
                                <p className="text-xs text-slate-500">Pay using Visa, Mastercard, or Rupay</p>
                            </div>
                        </button>

                        {/* UPI Option */}
                        <button
                            onClick={() => setMethod('upi')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${method === 'upi' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className={`p-3 rounded-xl ${method === 'upi' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Smartphone size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900">UPI (PhonePe / GPay)</p>
                                <p className="text-xs text-slate-500">Fast and secure mobile payments</p>
                            </div>
                        </button>

                        {/* COD Option */}
                        <button
                            onClick={() => setMethod('cod')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${method === 'cod' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className={`p-3 rounded-xl ${method === 'cod' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Banknote size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900">Cash on Delivery</p>
                                <p className="text-xs text-slate-500">Pay when you receive your order</p>
                            </div>
                        </button>
                    </div>

                    {/* Conditional Input Fields for simulation */}
                    {method === 'card' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 mb-6">
                            <input type="text" placeholder="Card Number" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-none text-sm" />
                            <div className="flex gap-3">
                                <input type="text" placeholder="MM/YY" className="w-1/2 p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-none text-sm" />
                                <input type="text" placeholder="CVV" className="w-1/2 p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-none text-sm" />
                            </div>
                        </motion.div>
                    )}

                    {method === 'upi' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                            <input type="text" placeholder="Enter UPI ID (e.g. user@okhdfc)" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:outline-none text-sm" />
                        </motion.div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? 'Processing...' : `Confirm Order (₹${totalAmount.toFixed(2)})`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Calculate Fees - Apply 5% platform fee if total purchase amount exceeds ₹100
    const platformFee = total > 100 ? total * 0.05 : 0;
    const finalTotal = total + platformFee;

    const initiateCheckout = () => {
        setIsCheckingOut(true);
        setTimeout(() => {
            setIsCheckingOut(false);
            setShowPaymentModal(true);
        }, 800);
    };

    const handleConfirmPayment = async (method) => {
        setShowPaymentModal(false);
        setIsCheckingOut(true);

        try {
            // Transform cart to order items structure
            const orderItems = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, {
                consumerId: user.id,
                items: orderItems,
                totalAmount: finalTotal,
                paymentMethod: method
            });

            setOrderSuccess(true);
            setTimeout(() => {
                clearCart();
                setOrderSuccess(false);
                setIsCheckingOut(false);
                navigate('/marketplace');
            }, 4000);

        } catch (err) {
            console.error('Checkout Error:', err);
            alert("Checkout failed. Please try again.");
            setIsCheckingOut(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-12 text-center max-w-md shadow-2xl border border-green-100"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Order Placed!</h2>
                    <p className="text-slate-500 mb-8">Thank you for supporting local farmers. Your fresh produce is on its way to you.</p>
                    <p className="text-sm font-bold text-primary animate-pulse">Redirecting to marketplace...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light pt-28 pb-12 px-6">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-primary" /> Your Cart
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                        <p className="text-slate-500 mb-8">Looks like you haven't added any fresh produce yet.</p>
                        <button
                            className="bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                            onClick={() => navigate('/marketplace')}
                        >
                            <Package className="w-5 h-5" /> Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            <AnimatePresence>
                                {cart.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                                            <p className="text-slate-500 text-sm">₹{item.price} / {item.unit}</p>
                                        </div>

                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="font-bold text-lg text-slate-900 w-24 text-right">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>

                                        <button
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-96">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 sticky top-28">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span className="font-bold">₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Platform Fee {total > 100 && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">5%</span>}</span>
                                        <span className="font-bold">₹{platformFee.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 my-4"></div>
                                    <div className="flex justify-between text-lg font-black text-slate-900">
                                        <span>Total</span>
                                        <span>₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                    onClick={initiateCheckout}
                                    disabled={isCheckingOut}
                                >
                                    {isCheckingOut ? (
                                        'Processing...'
                                    ) : (
                                        <>Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>

                                <p className="text-xs text-center text-slate-400 mt-4">
                                    Secure checkout powered by FarmDirect
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showPaymentModal && (
                <PaymentModal
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handleConfirmPayment}
                    totalAmount={finalTotal}
                />
            )}
        </div>
    );
};

export default CartPage;
