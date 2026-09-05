import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const { isAuthenticated, user } = useAuthStore.getState();
        if (!isAuthenticated || !user || (user.role || '').toLowerCase().trim() !== 'user') {
          return false;
        }
        const prodId = product.id || product._id;
        const exists = get().items.find((p) => (p.id === prodId || p._id === prodId));
        if (exists) {
          set({ items: get().items.filter((p) => (p.id !== prodId && p._id !== prodId)) });
        } else {
          set({ items: [...get().items, { ...product, id: prodId, _id: prodId }] });
        }
        return true;
      },
      isWished: (id) => !!get().items.find((p) => p.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'ethioshop-wishlist' }
  )
);
