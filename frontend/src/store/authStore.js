import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import api from '../utils/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function applyAuthData(data) {
  const { accessToken, permissions, ...user } = data;
  return {
    isAuthenticated: true,
    token: accessToken,
    user,
    permissions: permissions || [],
  };
}

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      permissions: [],

      setToken: (token) => set({ token }),

      register: async ({ firstName, lastName, email, password }) => {
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/register`,
          { firstName, lastName, email, password },
          { withCredentials: true }
        );
        if (!data?.data?.accessToken) {
          throw new Error(data?.message || 'Registration failed');
        }
        set(applyAuthData(data.data));
        return data.data;
      },

      login: async ({ email, password }) => {
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/login`,
          { email, password },
          { withCredentials: true }
        );
        if (!data?.data?.accessToken) {
          throw new Error(data?.message || 'Login failed');
        }
        set(applyAuthData(data.data));
        return data.data;
      },

      loginWithGoogle: async (idToken) => {
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/google`,
          { idToken },
          { withCredentials: true }
        );
        if (!data?.data?.accessToken) {
          throw new Error(data?.message || 'Google sign-in failed');
        }
        set(applyAuthData(data.data));
        return data.data;
      },

      signOut: async () => {
        try {
          await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
        } catch {
          /* ignore */
        }
        set({ isAuthenticated: false, user: null, token: null, permissions: [] });
      },

      can: (permission) => {
        const { permissions } = useAuthStore.getState();
        return permissions.includes(permission);
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      /** Refresh profile from API (e.g. after role change) */
      fetchProfile: async () => {
        const { data } = await api.get('/api/auth/profile');
        if (data?.data) {
          const { permissions: perms, ...userFields } = data.data;
          set({
            user: userFields,
            permissions: perms || [],
          });
        }
      },
    }),
    {
      name: 'ethioshop-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
);
