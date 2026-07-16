import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/product';
import CartService from '../api/CartService';

interface CartItem extends Product {
  quantity: number;
  cart_item_id?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string | number) => Promise<void>;
  updateQuantity: (productId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      syncWithServer: async () => {
        try {
          const response = await CartService.getCart();
          if (response.data && response.data.items) {
            set({ items: response.data.items });
          }
        } catch (error) {
          console.error("Error syncing cart with server", error);
        }
      },

      addItem: async (product, quantity = 1) => {
        // Optimistic update locally
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity }] };
        });

        // Sync with server if logged in
        try {
          await CartService.addItem(Number(product.id), quantity);
        } catch (error) {
          // If error (e.g. not logged in), it just stays in localStorage which is fine for guest
        }
      },

      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

        try {
          await CartService.removeItem(Number(productId));
        } catch (error) {}
      },

      updateQuantity: async (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
          ).filter(item => item.quantity > 0),
        }));

        try {
          await CartService.updateItem(Number(productId), quantity);
        } catch (error) {}
      },

      clearCart: async () => {
        set({ items: [] });
        try {
          await CartService.clearCart();
        } catch (error) {}
      },

      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      getTotalPrice: () => get().items.reduce((acc, item) => {
        const price = item.discountPrice || item.price;
        return acc + price * item.quantity;
      }, 0),

      getFinalTotal: () => {
        const subtotal = get().getTotalPrice();
        const shipping = subtotal > 5000 ? 0 : 250;
        return subtotal + shipping;
      },
    }),
    {
      name: 'elite-cart-storage',
    }
  )
);
