import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Heart, Zap, Package, CheckCircle2 } from 'lucide-react';
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
  const cartItem = cartItems.find(item => String(item.id) === String(product.id));
  const quantityInCart = cartItem?.quantity || 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: async () => {
        const { data } = await api.get(`/products/${product.id}`);
        return data;
      },
      staleTime: 60000,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addNotification('info', 'Inicia sesión para comprar');
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
      className={`group relative flex flex-col glass-card h-full cursor-pointer overflow-hidden transition-all duration-500 ${
        quantityInCart > 0
          ? 'ring-2 ring-brand-primary bg-brand-primary/[0.03] shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)]'
          : 'hover:shadow-soft border-transparent'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full p-4 sm:p-6 overflow-hidden bg-slate-50 dark:bg-white/[0.02]">
        <div className={`w-full h-full flex items-center justify-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          <img
            src={getAssetUrl(product.images?.[0])}
            alt={product.name}
            className="max-w-[90%] max-h-[90%] object-contain drop-shadow-soft dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.isNew && (
            <div className="bg-brand-primary text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg">
              Nuevo
            </div>
          )}
          {product.stock <= 0 && (
            <div className="bg-slate-500 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg">
              Agotado
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

        {/* Quantity in Cart Indicator */}
        <AnimatePresence>
          {quantityInCart > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute bottom-4 left-4 z-20 bg-brand-success text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2"
            >
              <Package size={12} />
              {quantityInCart} EN BOLSA
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 pt-4 sm:pt-0">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-brand-primary truncate">
            {product.brand}
          </span>
          <div className="flex items-center gap-1.5">
             <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} DISP.` : 'AGOTADO'}
             </div>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold leading-tight line-clamp-2 min-h-[2.5rem] mb-4 text-light-text dark:text-white group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Inversión</p>
             <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-brand-primary">RD$</span>
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-light-text dark:text-white">
                  {(product.discountPrice || product.price).toLocaleString()}
                </span>
             </div>
          </div>

          {showActions && isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                quantityInCart > 0
                ? 'bg-brand-success text-white shadow-lg shadow-brand-success/20 ring-4 ring-brand-success/10'
                : 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95'
              } disabled:opacity-30 disabled:grayscale disabled:scale-100`}
            >
              {quantityInCart > 0 ? <CheckCircle2 size={24} /> : <ShoppingCart size={20} />}
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
