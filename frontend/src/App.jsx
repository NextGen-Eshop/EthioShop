import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Storefront
import StorefrontLayout from './pages/StorefrontLayout';
import Home from './pages/Home';
import StorefrontProducts from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import Contact from './pages/Contact';

// Admin
import AdminLayout from './admin/components/layout/AdminLayout';
import Orders from './admin/pages/Orders';
import Overview from './admin/pages/Overview';
import Products from './admin/pages/Products';
import Users from './admin/pages/Users';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Storefront (public) ── */}
        <Route element={<StorefrontLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<StorefrontProducts />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ── Admin (protected, admin role only) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
