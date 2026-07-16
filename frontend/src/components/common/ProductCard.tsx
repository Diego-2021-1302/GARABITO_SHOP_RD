import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Heart, Zap, Package } from 'lucide-react';
import type { Product } from '../../types/product';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { getAssetUrl } from '../../utils/asset';
import api from '../../api/axios';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showActions = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { items: cartItems, addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isWishlisted = isInWishlist(product.id);
  // Busqueda robusta por ID (numérico o string) para asegurar concurrencia
  const cartItem = cartItems.find(item => String(item.id) === String(product.id));
  const quantityInCart = cartItem?.quantity || 0;

  // Optimización de rendimiento: Pre-fetch de datos al hacer hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: async () => {
        const { data } = await api.get(`/products/${product.id}`);
        return data;
      },
      staleTime: 60000, // 1 minuto de frescura
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addNotification('info', 'Inicia sesión para comprar');
      document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (product.stock <= 0) {
      addNotification('error', 'Producto agotado');
      return;
    }
    addItem(product, 1);
    addNotification('success', 'Añadido al carrito');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addNotification('info', 'Inicia sesión para favoritos');
      return;
    }
    toggleItem(product);
  };

  return (
    <motion.article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/producto/${product.id}`)}
      className="group relative flex flex-col glass-card h-full cursor-pointer overflow-hidden"
    >
      {/* Image Container - Minimalist */}
      <div className="relative aspect-square w-full p-4 overflow-hidden">
        <div className={`w-full h-full flex items-center justify-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          <img
            src={getAssetUrl(product.images?.[0])}
            alt={product.name}
            className="max-w-[85%] max-h-[85%] object-contain drop-shadow-soft dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.isNew && (
            <div className="bg-brand-primary text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg">
              Nuevo
            </div>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={handleWishlist}
            className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-all z-20 backdrop-blur-md ${
              isWishlisted
                ? 'bg-brand-primary border-brand-primary text-white'
                : 'bg-white/50 dark:bg-black/20 border-white/20 text-slate-400'
            }`}
          >
            <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        )}
      </div>

      {/* Info Section - Minimalist */}
      <div className="flex flex-col flex-1 p-6 pt-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-brand-primary opacity-80">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <Star size={10} className="fill-brand-primary text-brand-primary" />
            {(product.rating || 5.0).toFixed(1)}
          </div>
        </div>

        <h3 className="text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem] mb-4 group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
             <span className="text-[10px] font-black text-brand-primary">RD$</span>
             <span className="text-xl font-black tracking-tighter">
              {(product.discountPrice || product.price).toLocaleString()}
            </span>
          </div>

          {showActions && isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                quantityInCart > 0
                ? 'bg-brand-success text-white shadow-lg shadow-brand-success/20'
                : 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
              }`}
            >
              <ShoppingCart size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
