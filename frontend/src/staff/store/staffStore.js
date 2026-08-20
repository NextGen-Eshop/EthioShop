import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  initialStaffProducts,
  initialStaffOrders,
  initialChapaConfig,
  staffCategories,
} from '../data/staffData';

export const useStaffStore = create(
  persist(
    (set, get) => ({
      products: initialStaffProducts,
      orders: initialStaffOrders,
      categories: staffCategories,
      chapaConfig: initialChapaConfig,
      staffAvatar: null, // base64 or URL string; null = use initials fallback

      // ── Profile Avatar ──
      setStaffAvatar: (avatarData) => set({ staffAvatar: avatarData }),

      // ── Product & Inventory Actions ──
      addProduct: (newProduct) => {
        const product = {
          id: `sp-${Date.now()}`,
          name: newProduct.name,
          category: newProduct.category || 'Coffee & Tea',
          price: Number(newProduct.price) || 0,
          originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price) || 0,
          stock: Number(newProduct.stock) || 0,
          lowStockThreshold: Number(newProduct.lowStockThreshold) || 5,
          sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
          image: newProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          description: newProduct.description || '',
          location: newProduct.location || '',
          status: Number(newProduct.stock) > 0 ? 'active' : 'out_of_stock',
        };
        set((state) => ({ products: [product, ...state.products] }));
        return product;
      },

      updateProduct: (id, updatedFields) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === id) {
              const stock = updatedFields.stock !== undefined ? Number(updatedFields.stock) : p.stock;
              return {
                ...p,
                ...updatedFields,
                stock,
                status: stock > 0 ? 'active' : 'out_of_stock',
              };
            }
            return p;
          }),
        }));
      },

      updateStock: (id, newStock) => {
        const count = Math.max(0, Number(newStock) || 0);
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, stock: count, status: count > 0 ? 'active' : 'out_of_stock' }
              : p
          ),
        }));
      },

      updatePrice: (id, newPrice, newOriginalPrice) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  price: Number(newPrice) || p.price,
                  originalPrice: newOriginalPrice ? Number(newOriginalPrice) : p.originalPrice,
                }
              : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      // ── Order & Lifecycle Processing Actions ──
      updateOrderStatus: (orderId, newStatus, contextData = {}) => {
        const state = get();
        const existingOrder = state.orders.find((o) => o.id === orderId);
        if (!existingOrder) return;

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let note = `Status changed to ${newStatus}`;

        // Contextual notes & actions
        if (newStatus === 'confirmed') {
          note = 'Order verified & inventory allocated';
        } else if (newStatus === 'processing') {
          note = contextData.carrier
            ? `Assigned to ${contextData.carrier} for packaging`
            : 'Packaging & quality inspection in progress';
        } else if (newStatus === 'shipped') {
          note = `Dispatched via ${contextData.carrier || 'Courier'}. Tracking #${contextData.trackingNumber || 'Pending'}`;
        } else if (newStatus === 'delivered') {
          note = 'Delivered to recipient. Payout credited to staff wallet balance.';
          // Credit available balance
          const net = existingOrder.chapaPayment?.netPayout || existingOrder.totalAmount * 0.98;
          set((s) => ({
            chapaConfig: {
              ...s.chapaConfig,
              availableBalance: s.chapaConfig.availableBalance + net,
              pendingSettlement: Math.max(0, s.chapaConfig.pendingSettlement - net),
            },
          }));
        } else if (newStatus === 'cancelled') {
          note = `Order cancelled. Reason: ${contextData.cancellationReason || 'Staff/Customer request'}. Stock restored.`;
          // Restore stock for all items
          existingOrder.items.forEach((item) => {
            const prod = state.products.find((p) => p.name === item.name || p.sku === item.sku);
            if (prod) {
              get().updateStock(prod.id, prod.stock + item.qty);
            }
          });
        }

        const newTimelineEntry = {
          status: newStatus,
          time: timeString,
          note,
        };

        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  carrier: contextData.carrier || o.carrier,
                  trackingNumber: contextData.trackingNumber || o.trackingNumber,
                  cancellationReason: contextData.cancellationReason || o.cancellationReason,
                  timeline: [...(o.timeline || []), newTimelineEntry],
                }
              : o
          ),
        }));
      },

      // ── Chapa Payment & Payout Configuration ──
      updateChapaConfig: (newConfig) => {
        set((state) => ({
          chapaConfig: {
            ...state.chapaConfig,
            ...newConfig,
          },
        }));
      },

    }),
    { name: 'ethioshop-staff-store' }
  )
);
