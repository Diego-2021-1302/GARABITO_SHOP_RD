import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const totalItems = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Inicio', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Catálogo', path: '/catalogo' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Carrito', path: '/carrito', count: totalItems, protected: true },
    { icon: <Heart className="w-5 h-5" />, label: 'Favoritos', path: '/cuenta/favoritos', protected: true },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Perfil',
      path: ['admin', 'driver', 'vendor'].includes(user?.role || '') ? '/admin' : '/cuenta',
      protected: true
    },
  ];

  // Filtramos los items si el usuario no está autenticado
  const filteredItems = navItems.filter(item => !item.protected || isAuthenticated);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#020617]/90 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 px-2 pt-3 pb-[env(safe-area-inset-bottom,1.5rem)] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] z-[100]">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="relative flex flex-col items-center gap-1.5 py-1 min-w-[64px] outline-none group"
            >
              <motion.div 
                animate={{ 
                  y: isActive ? -2 : 0,
                  scale: isActive ? 1.1 : 1
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-brand-primary' : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                {item.icon}
                
                {/* Badge de Carrito Dinámico con estilo Exploration */}
                <AnimatePresence mode="wait">
                  {item.count !== undefined && item.count > 0 && (
                    <motion.span 
                      key={item.count}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 bg-brand-primary text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-[#020617] shadow-lg shadow-brand-primary/40"
                    >
                      {item.count > 9 ? '9+' : item.count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-200 ${
                isActive ? 'text-brand-primary' : 'text-slate-400 dark:text-gray-600'
              }`}>
                {item.label}
              </span>

              {/* Indicador de Estado Activo con estilo Exploration */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-2xl z-0 border border-brand-primary/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
