import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/product';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  isInWishlist: (productId: string | number) => boolean;
  toggleItem: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => ({
        items: state.items.some(i => i.id === product.id) 
          ? state.items 
          : [...state.items, product]
      })),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.id !== productId),
      })),
      isInWishlist: (productId) => get().items.some(item => item.id === productId),
      toggleItem: (product) => {
        const { isInWishlist, removeItem, addItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
