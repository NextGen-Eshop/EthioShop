import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  adminUsers,
  adminStaff,
  adminCategories,
  adminPayments,
  adminNotifications,
  adminSystemSettings,
} from '../data/adminData';

export const useAdminStore = create(
  persist(
    (set, get) => ({
      users: [],
      staff: [],
      categories: adminCategories,
      payments: [],
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      settings: adminSystemSettings,
      adminAvatar: null,

      // ── Admin Profile ──
      setAdminAvatar: (avatarData) => set({ adminAvatar: avatarData }),

      // ── Users ──
      addUser: (userData) => {
        const user = {
          id: `u-${Date.now()}`,
          ...userData,
          orders: 0,
          joined: new Date().toISOString().split('T')[0],
          avatar: '',
        };
        set((s) => ({ users: [user, ...s.users] }));
        return user;
      },
      updateUser: (id, fields) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...fields } : u)) })),
      deleteUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      toggleUserStatus: (id) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
          ),
        })),

      // ── Staff ──
      addStaff: (staffData) => {
        const member = {
          id: `s-${Date.now()}`,
          ...staffData,
          role: 'staff',
          products: 0,
          joined: new Date().toISOString().split('T')[0],
          avatar: '',
        };
        set((s) => ({ staff: [member, ...s.staff] }));
        return member;
      },
      updateStaff: (id, fields) =>
        set((s) => ({ staff: s.staff.map((m) => (m.id === id ? { ...m, ...fields } : m)) })),
      deleteStaff: (id) =>
        set((s) => ({ staff: s.staff.filter((m) => m.id !== id) })),
      toggleStaffStatus: (id) =>
        set((s) => ({
          staff: s.staff.map((m) =>
            m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
          ),
        })),

      // ── Categories ──
      addCategory: (catData) => {
        const cat = {
          id: `cat-${Date.now()}`,
          ...catData,
          products: 0,
        };
        set((s) => ({ categories: [cat, ...s.categories] }));
        return cat;
      },
      updateCategory: (id, fields) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...fields } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // ── Notifications ──
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      deleteNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      // ── Settings ──
      updateSettings: (newSettings) =>
        set((s) => ({ settings: { ...s.settings, ...newSettings } })),

      // ── Derived Selectors (callable as functions) ──
      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'ethioshop-admin-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (Array.isArray(state.notifications)) {
            state.notifications = state.notifications.filter((n) => n && n.id && !n.id.toString().startsWith('n-'));
          }
          if (Array.isArray(state.users)) {
            state.users = state.users.filter((u) => u && u.id && !u.id.toString().startsWith('u-'));
          }
          if (Array.isArray(state.staff)) {
            state.staff = state.staff.filter((s) => s && s.id && !s.id.toString().startsWith('s-'));
          }
        }
      },
    }
  )
);
