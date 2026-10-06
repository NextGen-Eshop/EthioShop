import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        storeName: 'EthioShop',
        storeTagline: "Ethiopia's Premium Online Store",
        storeDescription:
          "EthioShop is Ethiopia's leading e-commerce platform featuring authentic handcrafted products, electronics, leather goods, and traditional apparel.",
        storeEmail: 'hello@ethioshop.et',
        supportEmail: 'support@ethioshop.et',
        storePhone: '+251 11 234 5678',
        supportPhone: '+251 11 900 0000',
        storeAddress: 'Bole Atlas, Addis Ababa, Ethiopia',
        returnPolicy: '30-day hassle-free returns on all products except personalized or perishable items.',
        privacyPolicy: 'We respect your privacy and handle your data in accordance with Ethiopian data protection laws.',
        termsConditions: 'By using EthioShop, you agree to our terms and conditions of sale and service.',
        currency: 'ETB',
        shippingFee: 150,
        freeShippingMin: 3000,
        taxRate: 15,
        lowStockThreshold: 5,
        maintenanceMode: false,
        maintenanceMessage: 'EthioShop is currently undergoing maintenance. We will be back shortly!',
        orderAcceptance: true,
        notifyNewOrders: true,
        notifyLowStock: true,
        notifyFailedPayments: true,
        notifyNewUsers: true,
      },
      loading: false,

      // Fetch public settings from backend
      fetchSettings: async () => {
        try {
          set({ loading: true });
          const res = await fetch(`${API_URL}/api/settings`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              set((state) => ({
                settings: { ...state.settings, ...data.data },
                loading: false,
              }));
              return data.data;
            }
          }
        } catch (err) {
          console.warn('Could not fetch public settings, using cached/defaults:', err);
        } finally {
          set({ loading: false });
        }
      },

      // Update settings locally
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'ethioshop-system-settings',
    }
  )
);
