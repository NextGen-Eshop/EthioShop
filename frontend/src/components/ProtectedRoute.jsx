import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Wraps routes that require authentication.
 * Redirects to /login with a ?redirect= param so the user
 * is sent back after signing in.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
}
