import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' | 'light'
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: nextTheme });
      },
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ethioshop-theme',
    }
  )
);
