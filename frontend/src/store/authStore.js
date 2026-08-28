import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildUser = (data) => ({
  id: data._id ?? data.id ?? `user-${Date.now()}`,
  name: data.name ?? (`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Shopper'),
  firstName: data.firstName ?? '',
  lastName: data.lastName ?? '',
  email: data.email ?? '',
  role: (data.role ?? 'user').toString().toLowerCase().trim(),
  provider: data.provider ?? 'email',
  avatar: data.avatar ?? '',
  accessToken: data.accessToken ?? '',
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      error: null,
      isCheckingAuth: false,

      // Sync fresh user info directly from database
      checkAuth: async () => {
        const state = get();
        const currentUser = state.user;
        const token = currentUser?.accessToken;
        
        // If not logged in, don't make unauthorized calls to /api/auth/profile
        if (!state.isAuthenticated || !token) {
          return;
        }

        set({ isCheckingAuth: true });
        try {
          // If we have an access token, try to fetch current user profile from DB
          const res = await fetch(`${API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (res.ok) {
            const json = await res.json();
            if (json?.data) {
              const refreshedUser = buildUser({ ...json.data, accessToken: token });
              set({ isAuthenticated: true, user: refreshedUser, error: null });
              return refreshedUser;
            }
          }

          // If token expired, attempt refresh via cookie
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const refreshJson = await refreshRes.json();
            const newToken = refreshJson.accessToken;
            const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
            });

            if (profileRes.ok) {
              const profileJson = await profileRes.json();
              const refreshedUser = buildUser({ ...profileJson.data, accessToken: newToken });
              set({ isAuthenticated: true, user: refreshedUser, error: null });
              return refreshedUser;
            }
          }

          // If session expired and cannot refresh, reset auth cleanly
          set({ isAuthenticated: false, user: null });
        } catch (err) {
          // Backend unreachable or offline - silent fallback
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      // Email sign-in — calls backend API
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

      // Email registration — calls backend API
      registerEmail: async ({ firstName, lastName, email, password, role }) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ firstName, lastName, email, password, role }),
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

      // Google sign-in — sends credential token to backend for verification
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
    { name: 'ethioshop-auth' }
  )
);
