import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './admin/components/layout/AdminLayout';
import Orders from './admin/pages/Orders';
import Overview from './admin/pages/Overview';
import Products from './admin/pages/Products';
import Users from './admin/pages/Users';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Storefront
import StorefrontLayout from './pages/StorefrontLayout';
import Home from './pages/Home';
import StorefrontProducts from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import { useAuthStore } from './store/authStore';

// User Storefront Components (New)
import SettingsPage from './pages/Settings';
import NotificationsPage from './pages/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Storefront (customer-facing) */}
        <Route element={<StorefrontLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<StorefrontProducts />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
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
