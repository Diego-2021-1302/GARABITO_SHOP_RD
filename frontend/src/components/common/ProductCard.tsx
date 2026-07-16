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
      className={`group relative flex flex-col bg-[#0B0F1A]/60 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border transition-all duration-500 h-full cursor-pointer shadow-lg ${
        quantityInCart > 0
        ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
        : 'border-white/5 hover:border-brand-primary/40'
      }`}
    >
      {/* Cart Quantity Indicator Badge - Premium Style */}
      <AnimatePresence>
        {quantityInCart > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-0 right-0 z-30"
          >
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-bl-[1.5rem] font-black flex items-center gap-2 shadow-xl">
              <ShoppingCart size={12} className="fill-current" />
              <span className="text-[10px] uppercase tracking-tighter">{quantityInCart} EN CARRITO</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Container - Square & Compact */}
      <div className="relative aspect-square w-full bg-gradient-to-b from-white/[0.02] to-transparent p-3 sm:p-6">
        <div className={`w-full h-full flex items-center justify-center relative z-10 transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          <img
            src={getAssetUrl(product.images?.[0])}
            alt={product.name}
            className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Badges & Actions */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-2">
          {product.isNew && (
            <div className="bg-brand-primary text-white text-[7px] sm:text-[9px] font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg shadow-lg">
              <Zap size={8} className="inline mr-1 fill-current" />
              Nuevo
            </div>
          )}
          {quantityInCart > 0 && (
            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[7px] sm:text-[9px] font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">
              Apartado
            </div>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-xl border transition-all z-20 backdrop-blur-md ${
              isWishlisted ? 'bg-brand-primary border-brand-primary text-white' : 'bg-black/30 border-white/10 text-white/50'
            }`}
          >
            <Heart size={12} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 p-3 sm:p-6 sm:pt-2">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[7px] sm:text-[10px] font-black tracking-widest uppercase text-brand-primary truncate max-w-[60%]">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] sm:text-[10px] font-bold text-white/70">
            <Star size={8} className="fill-brand-primary text-brand-primary" />
            {(product.rating || 5.0).toFixed(1)}
          </div>
        </div>

        <h3 className="text-[11px] sm:text-[15px] font-bold text-gray-100 leading-snug line-clamp-2 min-h-[1.8rem] sm:min-h-[2.5rem] mb-2 sm:mb-4 group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
               <span className="text-[8px] sm:text-[11px] font-black text-brand-primary">RD$</span>
               <span className="text-sm sm:text-2xl font-black text-white tracking-tighter">
                {(product.discountPrice || product.price).toLocaleString()}
              </span>
            </div>
          </div>

          {showActions && isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                quantityInCart > 0
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-brand-primary text-white shadow-brand-primary/20'
              }`}
            >
              <ShoppingCart size={14} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </div>

        {/* Stock Status */}
        <div className={`mt-3 sm:mt-5 pt-2 sm:pt-4 border-t flex items-center justify-between transition-colors ${quantityInCart > 0 ? 'border-emerald-500/10' : 'border-white/5'}`}>
           <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? (quantityInCart > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]') : 'bg-red-500'}`} />
              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-500">
                Disp: <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>{product.stock}</span>
              </span>
           </div>

           {quantityInCart > 0 && (
             <motion.div
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-1 text-emerald-400"
             >
               <Package size={10} />
               <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter">Listo para Inversión</span>
             </motion.div>
           )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
