import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Wraps routes that require authentication and specific roles.
 * - If not authenticated: redirects to /login?redirect=...
 * - If role not authorized: redirects to /home
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRoles = null,
}) {
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

  // Determine roles allowed for this route
  const requiredRoles = allowedRoles || (adminOnly ? ['admin', 'staff'] : null);

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
