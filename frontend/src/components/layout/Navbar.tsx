import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Search, 
  Menu, 
  X, 
  Heart,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettings } from '../../hooks/useSettings';
import ThemeToggle from '../common/ThemeToggle';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  
  const totalItems = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const storeName = settings?.general.storeName || 'Garabito Shop';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    setIsMenuOpen(false);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
    if (query.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(query)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-[110] transition-all duration-500 ${
      isScrolled 
        ? 'glass-effect py-3 shadow-glass-light dark:shadow-glass-dark border-b'
        : 'bg-transparent py-6'
    }`}>
      <div className="container-custom mx-auto px-6">
        <div className="flex items-center justify-between gap-8">
          
          {/* LOGO & BRAND */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group relative z-10">
            <motion.div 
              whileHover={{ rotate: -8, scale: 1.05 }}
              className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20 group-hover:border-brand-primary/40 transition-all"
            >
              <img src="/logo.png" alt={storeName} className="w-6 h-6 object-contain" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-poppins font-black text-light-text dark:text-dark-text text-lg tracking-tighter uppercase leading-none">
                {storeName.split(' ')[0]} <span className="text-brand-primary">{storeName.split(' ')[1] || 'Shop'}</span>
              </span>
              <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 leading-none mt-1.5 opacity-60">
                Premium Store
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH - Minimalist */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              name="search"
              type="text" 
              placeholder="BUSCAR PRODUCTOS..."
              className="input-minimal pl-12 text-[10px] font-bold tracking-widest uppercase"
            />
          </form>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/carrito"
                  className="p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5 transition-all relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-brand-primary text-white text-[8px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-bg"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

                <Link 
                  to={['admin', 'driver', 'vendor'].includes(user?.role || '') ? "/admin" : "/cuenta"}
                  className="hidden sm:flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-brand-primary" />
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="btn-primary py-2.5 px-5"
              >
                Ingresar
              </button>
            )}
            
            <button 
              className="lg:hidden p-3 text-slate-500 dark:text-slate-400 active:scale-90 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass-effect border-b overflow-hidden lg:hidden shadow-2xl z-[100]"
          >
            <div className="p-8 space-y-8">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  name="search" 
                  type="text" 
                  placeholder="¿Qué buscas hoy?" 
                  className="input-minimal pl-12"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </form>

              <div className="grid grid-cols-2 gap-4">
                <Link to="/catalogo" className="p-5 glass-card flex flex-col gap-3 items-center">
                  <Search className="w-5 h-5 text-brand-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Catálogo</span>
                </Link>
                {isAuthenticated && (
                  <Link to="/cuenta" className="p-5 glass-card flex flex-col gap-3 items-center">
                    <User className="w-5 h-5 text-brand-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Mi Perfil</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
