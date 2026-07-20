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
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Carrito', path: '/carrito', count: totalItems, protected: true },
    { icon: <Heart className="w-5 h-5" />, label: 'Favoritos', path: '/cuenta/favoritos', protected: true },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Perfil',
      path: ['admin', 'driver', 'vendor'].includes(user?.role || '') ? '/admin' : '/cuenta',
      protected: true
    },
  ];

  // We want the bottom nav to be always visible but items might change
  const filteredItems = navItems.filter(item => {
    if (item.protected && !isAuthenticated) return false;
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-light-surface/80 dark:bg-[#0B0F1A]/80 backdrop-blur-2xl border border-light-border dark:border-white/10 px-4 py-3 rounded-[2rem] shadow-glass-light dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] z-[100] transition-all duration-500">
      <div className="flex items-center justify-between max-w-lg mx-auto relative">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="relative flex flex-col items-center gap-1 py-1 min-w-[50px] outline-none group"
            >
              <motion.div 
                animate={{ 
                  y: isActive ? -4 : 0,
                  scale: isActive ? 1.2 : 1
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative z-10 p-2 rounded-2xl transition-colors duration-300 ${
                  isActive ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/40' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.icon}
                
                <AnimatePresence>
                  {item.count !== undefined && item.count > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-brand-primary text-white text-[8px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-dark-bg shadow-sm"
                    >
                      {item.count > 9 ? '9+' : item.count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {!isActive && (
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
