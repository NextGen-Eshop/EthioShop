import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const buildUser = (payload) => ({
  id: payload.id ?? `user-${Date.now()}`,
  name: payload.name ?? 'Shopper',
  email: payload.email ?? '',
  provider: payload.provider ?? 'email',
  avatar: payload.avatar ?? '',
});

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      signInEmail: ({ email, name }) =>
        set({
          isAuthenticated: true,
          user: buildUser({
            name: name || email.split('@')[0],
            email,
            provider: 'email',
          }),
        }),
      registerEmail: ({ name, email }) =>
        set({
          isAuthenticated: true,
          user: buildUser({ name, email, provider: 'email' }),
        }),
      signInGoogle: ({ name, email, avatar }) =>
        set({
          isAuthenticated: true,
          user: buildUser({ name, email, avatar, provider: 'google' }),
        }),
      signOut: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: 'ethioshop-auth' }
  )
);
