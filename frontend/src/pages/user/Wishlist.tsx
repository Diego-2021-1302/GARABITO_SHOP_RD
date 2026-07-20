import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useNotificationStore } from '../../store/useNotificationStore';

const UserWishlist: React.FC = () => {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleMoveToCart = (product: any) => {
    addItemToCart(product);
    removeItem(product.id);
    addNotification('success', 'Producto movido al carrito');
  };

  if (items.length === 0) {
    return (
      <div className="card-premium p-12 text-center">
        <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-poppins font-bold mb-4">Tu lista de deseos está vacía</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Guarda los productos que más te gustan para comprarlos después o compartirlos con tus amigos.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Explorar Catálogo
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold">Mis Favoritos</h1>
          <p className="text-gray-500">Tienes {items.length} productos guardados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {items.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium flex gap-4 p-4 group"
            >
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/producto/${product.id}`} className="font-bold text-sm hover:text-brand-primary transition-colors line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-brand-primary">RD$ {(product.discountPrice || product.price).toLocaleString()}</span>
                  {product.discountPrice && (
                    <span className="text-[10px] text-gray-400 line-through">RD$ {product.price.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Mover al carrito
                  </button>
                  <button 
                    onClick={() => removeItem(product.id)}
                    className="p-2 border border-gray-100 dark:border-gray-700 rounded-lg hover:text-brand-error hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserWishlist;
