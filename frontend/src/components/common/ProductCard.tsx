import React, { useState } from 'react';
import { Star, Lock, ShoppingCart, Package, Eye } from 'lucide-react';
import type { Product } from '../../types/product';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getAssetUrl } from '../../utils/asset';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={8} className={i <= Math.round(rating) ? "fill-brand-primary text-brand-primary" : "fill-white/10 text-white/10"} />
    ))}
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, showActions = true }) => {
  const [hovered, setHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const navigate = useNavigate();

  return (
    <article
      className="group flex flex-col bg-[#0f172a]/20 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 hover:border-brand-primary/40 hover:bg-[#0f172a]/50 hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.2)] h-full relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[1/1] sm:aspect-[4/5] bg-gradient-to-b from-[#0B0F1A] to-transparent p-4 sm:p-8">
        <img
          src={getAssetUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isNew && (
            <span className="text-[7px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30">
              Nuevo
            </span>
          )}
          {product.discountPrice && (
            <span className="text-[7px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              Oferta
            </span>
          )}
        </div>

        {/* Action Overlay */}
        <div className={`absolute inset-0 bg-brand-dark/60 backdrop-blur-md transition-all duration-500 flex items-center justify-center gap-4 z-20 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
           <button
             className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl hover:bg-brand-primary hover:text-white transition-all active:scale-95"
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/producto/${product.id}`);
             }}
           >
             <Eye size={20} />
           </button>

           {showActions && (
             <button
               className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:shadow-brand-primary/40 transition-all active:scale-95"
               onClick={(e) => {
                 e.stopPropagation();
                 if (!isAuthenticated) {
                   addNotification('info', 'Inicia sesión para agregar productos al carrito');
                   document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' });
                   return;
                 }
                 addItem(product, 1);
                 addNotification('success', `${product.name} añadido`);
               }}
             >
               <ShoppingCart size={20} />
             </button>
           )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 gap-3 p-6 pt-0 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-brand-primary/80 group-hover:text-brand-primary transition-colors">
            {product.brand}
          </p>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
            <Star size={10} className="fill-brand-primary text-brand-primary" />
            <span className="text-[9px] font-black text-white/80">{(product.rating || 5).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-xs sm:text-sm font-black text-gray-200 leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-white transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          <div className="flex flex-col">
            {product.discountPrice && (
              <span className="text-[9px] text-gray-600 line-through font-bold">RD$ {product.price.toLocaleString()}</span>
            )}
            <span className="text-base sm:text-lg font-black text-white tracking-tighter">
              RD$ {(product.discountPrice || product.price).toLocaleString()}
            </span>
          </div>
          
          <div className={`px-2.5 py-1 rounded-lg border text-[7px] font-black uppercase tracking-widest ${
            product.stock > 0
              ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'
              : 'border-red-500/20 text-red-500 bg-red-500/5'
          }`}>
            {product.stock > 0 ? 'Disponible' : 'Agotado'}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
