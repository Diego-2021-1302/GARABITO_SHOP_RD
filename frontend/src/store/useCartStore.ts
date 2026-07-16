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
        // Solo sincronizar si hay un token para evitar llamadas innecesarias
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const response = await CartService.getCart();
          if (response.data && Array.isArray(response.data.items)) {
            set({ items: response.data.items });
          }
        } catch (error) {
          console.error("Error syncing cart with server:", error);
        }
      },

      addItem: async (product, quantity = 1) => {
        // Actualización optimista local con comparación robusta de IDs y LÍMITE DE STOCK
        set((state) => {
          const productIdStr = String(product.id);
          const existingItem = state.items.find((item) => String(item.id) === productIdStr);
          const maxAvailable = product.stock || 99;

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                String(item.id) === productIdStr
                  ? { ...item, quantity: Math.min(item.quantity + quantity, maxAvailable) }
                  : item
              ),
            };
          }

          // Limitar la cantidad inicial también al stock disponible
          const safeQuantity = Math.min(quantity, maxAvailable);
          return { items: [...state.items, { ...product, quantity: safeQuantity }] };
        });

        // Sincronizar con el servidor
        try {
          await CartService.addItem(Number(product.id), quantity);
          // Refrescar para asegurar que el estado local coincide exactamente con el server
          await get().syncWithServer();
        } catch (error) {
          console.error("Failed to add item to server cart", error);
        }
      },

      removeItem: async (productId) => {
        const productIdStr = String(productId);
        set((state) => ({
          items: state.items.filter((item) => String(item.id) !== productIdStr),
        }));

        try {
          await CartService.removeItem(Number(productId));
          await get().syncWithServer();
        } catch (error) {}
      },

      updateQuantity: async (productId, quantity) => {
        const productIdStr = String(productId);

        set((state) => {
          const item = state.items.find(i => String(i.id) === productIdStr);
          const maxAvailable = item?.stock || 99;
          const safeQuantity = Math.min(Math.max(0, quantity), maxAvailable);

          return {
            items: state.items.map((item) =>
              String(item.id) === productIdStr ? { ...item, quantity: safeQuantity } : item
            ).filter(item => item.quantity > 0),
          };
        });

        try {
          await CartService.updateItem(Number(productId), quantity);
          await get().syncWithServer();
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
