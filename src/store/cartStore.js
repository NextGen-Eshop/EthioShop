import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discountPercent: 0,
      
      addItem: (product, quantity = 1, color = 'Default') => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === product.id && item.selectedColor === color
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          } else {
            return { items: [...state.items, { ...product, quantity, selectedColor: color }] };
          }
        });
      },
      
      removeItem: (productId, color) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.id === productId && item.selectedColor === color))
        }));
      },
      
      updateQuantity: (productId, color, newQuantity) => {
        if (newQuantity < 1) return;
        set((state) => ({
          items: state.items.map((item) => 
            (item.id === productId && item.selectedColor === color) 
              ? { ...item, quantity: newQuantity } 
              : item
          )
        }));
      },
      
      applyPromo: (code) => {
        const validCodes = {
          'PREMIUM20': 20,
          'ETHIOSHOP10': 10
        };
        
        if (validCodes[code.toUpperCase()]) {
          set({ promoCode: code.toUpperCase(), discountPercent: validCodes[code.toUpperCase()] });
          return true;
        }
        return false;
      },
      
      removePromo: () => {
        set({ promoCode: null, discountPercent: 0 });
      },
      
      clearCart: () => set({ items: [], promoCode: null, discountPercent: 0 }),
      
      getCartTotal: () => {
        const state = get();
        const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discountAmount = subtotal * (state.discountPercent / 100);
        return {
          subtotal,
          discountAmount,
          total: subtotal - discountAmount
        };
      }
    }),
    {
      name: 'ethioshop-cart',
    }
  )
);
