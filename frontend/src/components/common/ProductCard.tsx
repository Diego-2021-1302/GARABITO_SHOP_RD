import React, { useState } from 'react';
import { Star, Lock, ShoppingCart, Package, Eye } from 'lucide-react';
import type { Product } from '../../types/product';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ProductCardProps {
  product: Product;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={8} className={i <= Math.round(rating) ? "fill-brand-primary text-brand-primary" : "fill-white/10 text-white/10"} />
    ))}
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const navigate = useNavigate();

  const resolveAssetUrl = (path: any) => {
    if (!path) return null;

    // Si el path es un objeto (de una relación antigua), extraemos la URL
    const finalPath = typeof path === 'object' ? path.image_url : path;

    if (!finalPath) return null;
    if (finalPath.startsWith('blob:') || finalPath.startsWith('data:')) return finalPath;

    let cleanPath = finalPath.replace(/\/+/g, '/');

    if (cleanPath.includes('/storage/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/storage/'));
    } else if (!cleanPath.startsWith('http') && !cleanPath.startsWith('/')) {
      cleanPath = `/storage/${cleanPath}`;
    }

    return cleanPath;
  };

  const specs = product.specifications ? Object.values(product.specifications).slice(0, 2) : ["Garantía"];

  return (
    <article
      className="group flex flex-col bg-[#0f172a]/20 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-500 hover:border-brand-primary/40 hover:bg-[#0f172a]/40 hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)] h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gradient-to-b from-[#0B0F1A] to-transparent p-6">
        <img
          src={resolveAssetUrl(product.images?.[0]) || '/logo.png'}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
              New
            </span>
          )}
          {product.discountPrice && (
            <span className="text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
              Sale
            </span>
          )}
        </div>

        {/* Action Overlay */}
        <div className={`absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center gap-3 ${hovered ? "opacity-100" : "opacity-0"}`}>
           <button
             className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/producto/${product.id}`);
             }}
           >
             <Eye size={20} />
           </button>

           <button
             className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
             onClick={(e) => {
               e.stopPropagation();
               if (!isAuthenticated) {
                 addNotification('info', 'Inicia sesión para agregar productos al carrito');
                 navigate('/login');
                 return;
               }
               addItem(product, 1);
               addNotification('success', `${product.name} añadido al carrito`);
             }}
           >
             <ShoppingCart size={20} />
           </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 gap-2 p-6 pt-2">
        <div className="flex items-center justify-between opacity-60">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-brand-primary">
            {product.brand}
          </p>
          <div className="flex items-center gap-1.5">
            <Star size={10} className="fill-brand-primary text-brand-primary" />
            <span className="text-[9px] font-black tracking-tighter">{(product.rating || 5).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-200 leading-snug line-clamp-1 group-hover:text-white transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            {product.discountPrice && (
              <span className="text-[10px] text-gray-600 line-through font-bold">RD$ {product.price.toLocaleString()}</span>
            )}
            <span className="text-lg font-black text-white tracking-tighter leading-none">
              RD$ {(product.discountPrice || product.price).toLocaleString()}
            </span>
          </div>
          
          <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-colors ${
            product.stock > 0
              ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'
              : 'border-red-500/20 text-red-500 bg-red-500/5'
          }`}>
            {product.stock > 0 ? 'In Stock' : 'Out'}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
