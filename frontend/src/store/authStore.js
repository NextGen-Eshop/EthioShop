import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildUser = (data) => ({
  id: data._id ?? data.id ?? `user-${Date.now()}`,
  name: data.name ?? (`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Shopper'),
  firstName: data.firstName ?? '',
  lastName: data.lastName ?? '',
  email: data.email ?? '',
  role: data.role ?? 'user',
  provider: data.provider ?? 'email',
  avatar: data.avatar ?? '',
  accessToken: data.accessToken ?? '',
});

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      error: null,

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
          set({ isAuthenticated: true, user: buildUser(json.data), error: null });
          return json.data;
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
          set({ isAuthenticated: true, user: buildUser(json.data), error: null });
          return json.data;
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
            body: JSON.stringify({ credential }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || 'Google sign-in failed');
          set({ isAuthenticated: true, user: buildUser(json.data), error: null });
          return json.data;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      signOut: () => set({ isAuthenticated: false, user: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    { name: 'ethioshop-auth' }
  )
);
