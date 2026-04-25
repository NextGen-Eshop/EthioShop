import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ProtectedRoute — guards routes behind authentication and optional role checks.
 *
 * @param {React.ReactNode} children — the page content
 * @param {string} [requiredRole] — optional role guard ('privileged')
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    // Not logged in → redirect to login, preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role → redirect home
    return <Navigate to="/home" replace />;
  }

  return children;
}
