import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const existing = get().items.find((item) => item.id === product.id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              quantity,
            },
          ],
        });
      },
      decrementItem: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        if (item.quantity <= 1) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({ items: get().items.map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) });
        }
      },
      clearCart: () => set({ items: [] }),
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'ethioshop-cart' }
  )
);
