import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,

      get isAuthenticated() {
        return !!get().user;
      },

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const user = response.data.data; // Auth endpoint returns data object
          set({ user });
          return { success: true, user };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed. Please try again.' 
          };
        }
      },

      register: async (data) => {
        try {
          const response = await api.post('/auth/register', data);
          const user = response.data.data;
          set({ user });
          return { success: true, user };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed. Please try again.' 
          };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          set({ user: null });
        }
      },
    }),
    { name: 'ethioshop-auth' }
  )
);
