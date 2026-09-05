import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildUser = (data) => ({
  id: data._id ?? data.id ?? `user-${Date.now()}`,
  _id: data._id ?? data.id,
  name: data.name ?? (`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Shopper'),
  firstName: data.firstName ?? '',
  lastName: data.lastName ?? '',
  email: data.email ?? '',
  role: (data.role ?? 'user').toString().toLowerCase().trim(),
  provider: data.provider ?? 'email',
  avatar: data.avatar ?? '',
  accessToken: data.accessToken ?? '',
  refreshToken: data.refreshToken ?? '',
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      error: null,
      isCheckingAuth: true,

      // Sync fresh user info directly from database without interrupting UI
      checkAuth: async () => {
        const state = get();
        const currentUser = state.user;
        const token = currentUser?.accessToken;

        // If there is no authenticated session in state, attempt cookie-based restoration first
        if (!state.isAuthenticated || !token) {
          try {
            const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            if (refreshRes.ok) {
              const refreshJson = await refreshRes.json();
              const newToken = refreshJson.accessToken;
              const profileRes = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${newToken}` },
                credentials: 'include',
              });
              if (profileRes.ok) {
                const profileJson = await profileRes.json();
                const restoredUser = buildUser({
                  ...profileJson.data,
                  accessToken: newToken,
                  refreshToken: refreshJson.refreshToken,
                });

                // Identity guard: if a different stored user exists, don't overwrite with the cookie's account.
                const storedEmail = currentUser?.email;
                const emailMismatch =
                  storedEmail &&
                  restoredUser.email &&
                  storedEmail.toLowerCase() !== restoredUser.email.toLowerCase();

                if (emailMismatch) {
                  // The cookie belongs to a different account — do not restore, clear unauthenticated state.
                  set({ isAuthenticated: false, user: null, isCheckingAuth: false, error: null });
                  return;
                }

                set({ isAuthenticated: true, user: restoredUser, isCheckingAuth: false, error: null });
                return restoredUser;
              }
            }
          } catch (_) {}
          set({ isCheckingAuth: false });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (res.ok) {
            const json = await res.json();
            if (json?.data) {
              const refreshedUser = buildUser({ ...json.data, accessToken: token, refreshToken: currentUser?.refreshToken });
              set({ isAuthenticated: true, user: refreshedUser, error: null });
              return refreshedUser;
            }
          }

          // If the access token is expired, try renewing ONLY with the stored body refreshToken.
          // We deliberately do NOT send credentials (cookie) here — the cookie belongs to whoever
          // last logged in on this browser and may be a completely different account (e.g. Admin).
          // Sending the cookie would silently replace Staff/User sessions with Admin's identity.
          const storedRefreshToken = currentUser?.refreshToken;
          if (!storedRefreshToken) {
            // No stored refresh token available — keep the existing session as-is rather than
            // falling back to the browser cookie which may belong to a different actor.
            set({ isAuthenticated: true, user: currentUser, isCheckingAuth: false });
            return currentUser;
          }

          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'omit', // ← CRITICAL: never send the cookie here; use body token only
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (refreshRes.ok) {
            const refreshJson = await refreshRes.json();
            const newToken = refreshJson.accessToken;
            const newRefreshToken = refreshJson.refreshToken || storedRefreshToken;
            const profileRes = await fetch(`${API_URL}/api/auth/me`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
              credentials: 'include',
            });

            if (profileRes.ok) {
              const profileJson = await profileRes.json();
              const refreshedUser = buildUser({
                ...profileJson.data,
                accessToken: newToken,
                refreshToken: newRefreshToken,
              });

              // Identity check: If the refreshed account does not match this tab's stored user,
              // do not overwrite the session — keep the stored identity intact.
              const emailMismatch =
                currentUser?.email &&
                refreshedUser.email &&
                currentUser.email.toLowerCase() !== refreshedUser.email.toLowerCase();
              const roleMismatch =
                currentUser?.role &&
                refreshedUser.role &&
                currentUser.role.toLowerCase() !== refreshedUser.role.toLowerCase();

              if (emailMismatch || roleMismatch) {
                set({ isAuthenticated: true, user: currentUser, isCheckingAuth: false });
                return currentUser;
              }

              set({ isAuthenticated: true, user: refreshedUser, error: null });
              return refreshedUser;
            }
          }

          // Refresh failed — keep the stored session alive rather than clearing it.
          // The user will be prompted to re-login next time they hit a protected API.
          set({ isAuthenticated: true, user: currentUser, isCheckingAuth: false });
          return currentUser;
        } catch (err) {
          // Network error — do not clear session, keep stored identity intact.
          set({ isAuthenticated: true, user: currentUser, isCheckingAuth: false });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      // Email sign-in
      signInEmail: async ({ email, password }) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || 'Login failed');
          const user = buildUser(json.data);
          set({ isAuthenticated: true, user, error: null });
          return user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // Email registration (Strictly user role)
      registerEmail: async ({ firstName, lastName, email, password }) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ firstName, lastName, email, password }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || 'Registration failed');
          const user = buildUser(json.data);
          set({ isAuthenticated: true, user, error: null });
          return user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // Google sign-in
      signInGoogle: async (credential) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken: credential, credential }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || 'Google sign-in failed');
          const user = buildUser(json.data);
          set({ isAuthenticated: true, user, error: null });
          return user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      signOut: async () => {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (_) {
          // ignore logout network errors
        }
        set({ isAuthenticated: false, user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ethioshop-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
          ? {
              ...state.user,
              avatar:
                state.user.avatar && state.user.avatar.startsWith('data:') && state.user.avatar.length > 2000
                  ? ''
                  : state.user.avatar,
            }
          : null,
      }),
    }
  )
);
