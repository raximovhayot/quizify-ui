import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // State
  isInitialized: boolean;
  
  // Actions
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isInitialized: false,
      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
