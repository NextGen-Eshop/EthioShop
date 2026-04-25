import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const STAFF_ROLES = ['admin', 'manager'];

/**
 * @param {{ children: import('react').ReactNode, adminOnly?: boolean, permission?: string | null }} props
 */
export default function ProtectedRoute({ children, adminOnly = false, permission = null }) {
  const { isAuthenticated, user, permissions } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !STAFF_ROLES.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }

  if (permission && !permissions.includes(permission)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
