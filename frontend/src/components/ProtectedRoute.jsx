import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Strict Role-Based ProtectedRoute
 * - If not authenticated: redirects to /login?redirect=...
 * - If user role does not match allowedRoles: redirects to user's authorized home dashboard
 */
export default function ProtectedRoute({
  children,
  allowedRoles = null,
}) {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080A12]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const userRole = (user?.role || 'user').toLowerCase().trim();

  // If specific roles are required
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(userRole)) {
    // Redirect each role to its own home
    if (userRole === 'admin') {
      return <Navigate to="/admin/overview" replace />;
    }
    if (userRole === 'staff') {
      return <Navigate to="/staff/overview" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
}
