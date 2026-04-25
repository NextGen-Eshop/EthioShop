import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './admin/components/layout/AdminLayout';
import Orders from './admin/pages/Orders';
import Overview from './admin/pages/Overview';
import Products from './admin/pages/Products';
import Users from './admin/pages/Users';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';
import AdminLogin from './admin/pages/Login';
import Register from './pages/Register';

// Storefront
import StorefrontLayout from './pages/StorefrontLayout';
import Home from './pages/Home';
import StorefrontProducts from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import CheckoutPage from './pages/CheckoutPage';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
          },
        }}
      />

      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Storefront (customer-facing) */}
        <Route element={<StorefrontLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<StorefrontProducts />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Protected: any authenticated user */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

          {/* Protected: privileged users only */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="privileged"><Dashboard /></ProtectedRoute>} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
