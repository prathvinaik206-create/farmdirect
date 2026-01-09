import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ConsumerMarketplace from './pages/ConsumerMarketplace';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import ConsumerProfile from './pages/ConsumerProfile';

// Components
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace'} />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace'} />} />

          {/* Farmer Routes */}
          <Route path="/farmer/*" element={
            <ProtectedRoute allowedRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          } />

          {/* Consumer Routes */}
          <Route path="/marketplace" element={
            <ProtectedRoute allowedRole="consumer">
              <ConsumerMarketplace />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute allowedRole="consumer">
              <ProductDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRole="consumer">
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/consumer/profile" element={
            <ProtectedRoute allowedRole="consumer">
              <ConsumerProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
