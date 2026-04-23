import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // Start with no user to show "Sign In"
  
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
  
  updateProfile: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null
  })),

  toggleRole: () => set((state) => ({
    user: state.user ? {
      ...state.user,
      role: state.user.role === 'regular' ? 'privileged' : 'regular'
    } : null
  })),
}));
