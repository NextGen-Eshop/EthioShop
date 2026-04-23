import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock accounts for demo
const MOCK_ACCOUNTS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@ethioshop.com',
    password: 'Admin123',
    role: 'privileged',
  },
  {
    id: 2,
    name: 'Regular User',
    email: 'user@ethioshop.com',
    password: 'User123',
    role: 'regular',
  },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,

      get isAuthenticated() {
        return !!get().user;
      },

      login: (email, password) => {
        const account = MOCK_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!account) {
          return { success: false, error: 'Invalid email or password' };
        }
        const { password: _, ...user } = account;
        set({ user });
        return { success: true, user };
      },

      register: (data) => {
        // Check if email already exists
        const exists = MOCK_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === data.email.toLowerCase()
        );
        if (exists) {
          return { success: false, error: 'An account with this email already exists' };
        }
        const newUser = {
          id: Date.now(),
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: 'regular',
        };
        set({ user: newUser });
        return { success: true, user: newUser };
      },

      logout: () => {
        set({ user: null });
      },
    }),
    { name: 'ethioshop-auth' }
  )
);
