import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../api/auth';
import { useCartStore } from './useCartStore';
import { useWishlistStore } from './useWishlistStore';
import { useRecentProductsStore } from './useRecentProductsStore';
import { useCompareStore } from './useCompareStore';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'driver' | 'vendor' | 'staff';
  avatar?: string;
  permissions?: string[];
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });

          set({
            user: response.user, 
            token: response.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          localStorage.setItem('token', response.token);

          // Sincronizar datos del servidor
          await useCartStore.getState().syncWithServer();
          // await useWishlistStore.getState().syncWithServer(); // TODO: Implement server side wishlist
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setAuth: async (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);

        // Sincronizar datos del servidor
        await useCartStore.getState().syncWithServer();
      },

      logout: () => {
        // Limpiar estados de todos los stores que persisten en localStorage
        // para evitar filtraciones de datos entre diferentes usuarios en la misma máquina
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();
        useRecentProductsStore.getState().clearHistory();
        useCompareStore.getState().clearCompare();

        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        window.location.href = '/login';
      },

      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
