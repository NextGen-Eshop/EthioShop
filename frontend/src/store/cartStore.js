import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.product.id === product.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + qty, product.stock) }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: Math.min(qty, product.stock) }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.min(qty, item.product.stock) }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get totalPrice() {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
    }),
    { name: 'ethioshop-cart' }
  )
);
