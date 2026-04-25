import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

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
import OrderPayment from './pages/OrderPayment';
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

const STAFF_ROLES = ['admin', 'manager'];

/**
 * Customer-only routes — staff are redirected to the admin hub.
 */
function UserOnlyRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (isAuthenticated && STAFF_ROLES.includes(user?.role)) {
    return <Navigate to="/admin/overview" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Storefront (public browsing) ── */}
        <Route element={<StorefrontLayout />}>
          {/* Public — anyone can browse */}
          <Route path="/home"           element={<Home />} />
          <Route path="/products"       element={<StorefrontProducts />} />
          <Route path="/products/:id"   element={<ProductDetail />} />
          <Route path="/privacy"        element={<Privacy />} />
          <Route path="/terms"          element={<Terms />} />
          <Route path="/support"        element={<Support />} />
          <Route path="/contact"        element={<Contact />} />

          {/* User-only — admins redirected to /admin/overview */}
          <Route path="/cart" element={<UserOnlyRoute><Cart /></UserOnlyRoute>} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <UserOnlyRoute>
                  <Checkout />
                </UserOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/payment"
            element={
              <ProtectedRoute>
                <UserOnlyRoute>
                  <OrderPayment />
                </UserOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <UserOnlyRoute>
                  <Account />
                </UserOnlyRoute>
              </ProtectedRoute>
            }
          />
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
          <Route path="overview"  element={<Overview />} />
          <Route path="products"  element={<Products />} />
          <Route path="orders"    element={<Orders />} />
          <Route path="users"     element={<Users />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings"  element={<Settings />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
