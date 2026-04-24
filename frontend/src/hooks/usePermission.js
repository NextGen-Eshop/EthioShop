import { useAuthStore } from '../store/authStore';

/**
 * usePermission — check permissions in any component
 *
 * const { can, isAdmin, isAuthenticated } = usePermission();
 *
 * can('delete_product')   → true/false
 * isAdmin                 → true/false
 */
export function usePermission() {
  const { isAuthenticated, user, permissions } = useAuthStore();

  return {
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    role: user?.role ?? null,
    can: (permission) => permissions.includes(permission),
    canAny: (...perms) => perms.some((p) => permissions.includes(p)),
    canAll: (...perms) => perms.every((p) => permissions.includes(p)),
  };
}
