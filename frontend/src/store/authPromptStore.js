import { create } from 'zustand';

export const useAuthPromptStore = create((set) => ({
  isOpen: false,
  message: 'Please login or signup to proceed',
  redirectUrl: '',
  pendingAction: null,

  openAuthPrompt: ({ message = 'Please login or signup to proceed', redirectUrl = '', pendingAction = null } = {}) => {
    // Save pending action to sessionStorage so it can survive page redirect
    if (pendingAction && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('ethioshop_pending_action', JSON.stringify(pendingAction));
      } catch (err) {
        console.error('Failed to store pending action:', err);
      }
    }
    set({
      isOpen: true,
      message,
      redirectUrl: redirectUrl || (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/home'),
      pendingAction,
    });
  },

  closeAuthPrompt: () => set({ isOpen: false, pendingAction: null }),
}));
