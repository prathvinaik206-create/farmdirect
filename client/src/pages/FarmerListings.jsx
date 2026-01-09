import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Pencil } from 'lucide-react';

const FarmerListings = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track which product is being edited
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        unit: 'kg',
        description: '',
        pincode: user?.address || '',
        image: ''
    });

    useEffect(() => {
        if (user) fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`https://farmdirect-2.onrender.com/api/products/farmer/${user.id}`);
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products");
        }
    };

    const handleEdit = (product) => {
        setNewProduct({
            name: product.name,
            price: product.price,
            unit: product.unit,
            description: product.description,
            pincode: product.pincode,
            image: product.image
        });
        setEditingId(product.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`https://farmdirect-2.onrender.com/api/products/${id}?farmerId=${user.id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...newProduct,
                farmerId: user.id,
                image: newProduct.image || 'https://images.unsplash.com/photo-1595855709915-d7b264906567?auto=format&fit=crop&w=400&q=80'
            };

            if (editingId) {
                // Update existing product
                await axios.put(`https://farmdirect-2.onrender.com/api/products/${editingId}`, productData);
                alert('Product updated successfully!');
            } else {
                // Create new product
                await axios.post('https://farmdirect-2.onrender.com/api/products', productData);
            }

            // Reset form
            setShowAddForm(false);
            setEditingId(null);
            setNewProduct({ name: '', price: '', unit: 'kg', description: '', pincode: user.address, image: '' });
            fetchProducts();
        } catch (err) {
            alert('Error saving product');
        }
    };

    const cancelEdit = () => {
        setShowAddForm(false);
        setEditingId(null);
        setNewProduct({ name: '', price: '', unit: 'kg', description: '', pincode: user.address, image: '' });
    };

    return (
        <div className="listings-page fade-in">
            <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>My Listings</h2>
                <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}>
                    <Plus size={18} style={{ marginRight: '5px' }} /> {showAddForm ? 'Close Form' : 'Add New Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-product-form card glass" style={{ marginBottom: '30px' }}>
                    <h3>{editingId ? 'Edit Product' : 'List New Product'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="input-group">
                            <label>Product Name</label>
                            <input type="text" className="input-field" placeholder="e.g. Fresh Tomatoes"
                                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Price (₹)</label>
                            <input type="number" className="input-field" placeholder="0.00"
                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Unit</label>
                            <select className="input-field" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                <option value="kg">Per Kg</option>
                                <option value="g">Per 100g</option>
                                <option value="litre">Per Litre</option>
                                <option value="dozen">Per Dozen</option>
                                <option value="piece">Per Piece</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Area Pincode</label>
                            <input type="text" className="input-field"
                                value={newProduct.pincode} onChange={e => setNewProduct({ ...newProduct, pincode: e.target.value })} required />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea className="input-field" rows="3"
                                value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Image URL (Optional)</label>
                            <input type="text" className="input-field" placeholder="https://..."
                                value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-secondary">{editingId ? 'Update Product' : 'List Product'}</button>
                            {editingId && <button type="button" className="btn" onClick={cancelEdit} style={{ background: '#ddd' }}>Cancel</button>}
                        </div>
                    </form>
                </div>
            )}

            <div className="products-grid">
                {products.length === 0 ? <p>No products listed yet.</p> : (
                    products.map(p => (
                        <div key={p.id} className="product-card card" style={{ position: 'relative' }}>
                            <div className="product-img" style={{ height: '200px', overflow: 'hidden', borderRadius: '8px', marginBottom: '15px' }}>
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h4>{p.name}</h4>
                            <p style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>₹{p.price}/{p.unit}</p>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{p.description}</p>

                            <div className="card-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#ffa500', color: 'white' }}
                                    onClick={() => handleEdit(p)}>
                                    <Pencil size={14} /> Edit
                                </button>
                                <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#ff4444', color: 'white' }}
                                    onClick={() => handleDelete(p.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FarmerListings;
