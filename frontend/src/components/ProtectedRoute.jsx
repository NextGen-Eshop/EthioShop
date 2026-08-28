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
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#3857d6] border-t-transparent" />
      </div>
    );
  }

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
  const userRole = (user?.role || '').toLowerCase().trim();

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
