import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const { isAuthenticated, user } = useAuthStore.getState();
        if (!isAuthenticated || !user || (user.role || '').toLowerCase().trim() !== 'user') {
          return false;
        }
        const prodId = product.id || product._id;
        const existing = get().items.find((item) => (item.id === prodId || item._id === prodId));
        if (existing) {
          set({
            items: get().items.map((item) =>
              (item.id === prodId || item._id === prodId) ? { ...item, quantity: item.quantity + quantity } : item
            ),
          });
          return true;
        }
        set({
          items: [
            ...get().items,
            {
              id: prodId,
              _id: prodId,
              name: product.name,
              image: product.image || product.imageUrl,
              price: product.price,
              shippingFee: product.shippingFee,
              isFreeShipping: product.isFreeShipping,
              deliveryFee: product.deliveryFee,
              quantity,
            },
          ],
        });
        return true;
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
