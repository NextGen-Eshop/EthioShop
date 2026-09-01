import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Auth pages
import Login from './auth/pages/Login';
import Register from './auth/pages/Register';
import ForgotPassword from './auth/pages/ForgotPassword';
import GoogleAuthCallback from './auth/pages/GoogleAuthCallback';

// User / Storefront Portal
import StorefrontLayout from './user/layout/StorefrontLayout';
import Home from './user/pages/Home';
import StorefrontProducts from './user/pages/Products';
import ProductDetail from './user/pages/ProductDetail';
import Cart from './user/pages/Cart';
import Checkout from './user/pages/Checkout';
import Account from './user/pages/Account';
import Privacy from './user/pages/Privacy';
import Terms from './user/pages/Terms';
import Support from './user/pages/Support';
import Contact from './user/pages/Contact';

// Staff Portal
import StaffLayout from './staff/layout/StaffLayout';
import StaffOverview from './staff/pages/StaffOverview';
import StaffProducts from './staff/pages/StaffProducts';
import StaffOrders from './staff/pages/StaffOrders';
import StaffPayments from './staff/pages/StaffPayments';
import StaffPromotions from './staff/pages/StaffPromotions';
import StaffSettings from './staff/pages/StaffSettings';

// Admin Portal
import AdminLayout from './admin/components/layout/AdminLayout';
import Overview from './admin/pages/Overview';
import Users from './admin/pages/Users';
import Staff from './admin/pages/Staff';
import Roles from './admin/pages/Roles';
import Products from './admin/pages/Products';
import Categories from './admin/pages/Categories';
import Inventory from './admin/pages/Inventory';
import Orders from './admin/pages/Orders';
import Payments from './admin/pages/Payments';
import AdminPromotions from './admin/pages/Promotions';
import AdminAnnouncements from './admin/pages/Announcements';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';
import Profile from './admin/pages/Profile';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'storefront');
    document.documentElement.setAttribute('data-mode', theme);
    document.body.className = theme === 'dark' ? 'bg-[#080A12] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#0F172A]';
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth (Public) ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

        {/* ── Storefront (Publicly accessible without requiring login) ── */}
        <Route element={<StorefrontLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<StorefrontProducts />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={['user', 'staff', 'admin']}>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ── Staff Operations Portal (Protected: staff and admin) ── */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/overview" replace />} />
          <Route path="overview" element={<StaffOverview />} />
          <Route path="products" element={<StaffProducts />} />
          <Route path="orders" element={<StaffOrders />} />
          <Route path="payments" element={<StaffPayments />} />
          <Route path="promotions" element={<StaffPromotions />} />
          <Route path="settings" element={<StaffSettings />} />
        </Route>

        {/* ── Admin (Protected: admin role strictly) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="staff" element={<Staff />} />
          <Route path="roles" element={<Roles />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
