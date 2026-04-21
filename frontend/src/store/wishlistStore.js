import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.find((p) => p.id === product.id);
        if (exists) {
          set({ items: get().items.filter((p) => p.id !== product.id) });
        } else {
          set({ items: [...get().items, product] });
        }
      },
      isWished: (id) => !!get().items.find((p) => p.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'ethioshop-wishlist' }
  )
);
