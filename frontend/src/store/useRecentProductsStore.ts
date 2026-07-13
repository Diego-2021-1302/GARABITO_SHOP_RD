import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/product';

interface RecentProductsState {
  items: Product[];
  addProduct: (product: Product) => void;
  clearHistory: () => void;
}

export const useRecentProductsStore = create<RecentProductsState>()(
  persist(
    (set) => ({
      items: [],
      addProduct: (product) => set((state) => {
        const filtered = state.items.filter((item) => item.id !== product.id);
        return {
          items: [product, ...filtered].slice(0, 10), // Keep last 10 products
        };
      }),
      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'recent-products-storage',
    }
  )
);
