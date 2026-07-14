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
    <nav className={`fixed top-0 w-full z-[110] transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-[#020617]/95 backdrop-blur-3xl py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border-b border-white/5'
        : 'bg-transparent py-6'
    }`}>
      <div className="container-custom mx-auto px-6">
        <div className="flex items-center justify-between gap-8">
          
          {/* LOGO & BRAND */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group relative z-10">
            <motion.div 
              whileHover={{ rotate: -8, scale: 1.05 }}
              className="w-11 h-11 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20 group-hover:border-brand-primary/40 transition-all shadow-lg shadow-brand-primary/5"
            >
              <img src="/logo.png" alt={storeName} className="w-7 h-7 object-contain" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-poppins font-black text-white text-xl tracking-tighter uppercase leading-none">
                {storeName.split(' ')[0]} <span className="text-brand-primary">{storeName.split(' ')[1] || 'Shop'}</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 leading-none mt-1.5 opacity-60">
                By UNICOMICOPTERO
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH - Integrated & Elegant */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors duration-300">
              <Search className="w-4 h-4" />
            </div>
            <input 
              name="search"
              type="text" 
              placeholder="Busca productos, marcas..." 
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:bg-white/[0.06] focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all duration-300 placeholder:text-gray-600 text-white shadow-inner"
            />
          </form>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/carrito"
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all relative group"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-brand-primary text-white text-[8px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-[#020617] shadow-lg shadow-brand-primary/20"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                <Link 
                  to="/cuenta/favoritos" 
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all hidden sm:flex"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <div className="w-px h-6 bg-white/10 mx-1 hidden lg:block" />

                <Link 
                  to={['admin', 'driver', 'vendor'].includes(user?.role || '') ? "/admin" : "/cuenta"}
                  className="hidden lg:flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-primary/30 hover:bg-white/[0.06] transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-brand-primary" />
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                     <span className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[70px]">
                       {user?.name.split(' ')[0]}
                     </span>
                     <span className="text-[7px] font-bold text-brand-primary uppercase tracking-[0.15em] mt-1 opacity-80">
                       {user?.role === 'admin' ? 'Administrador' :
                        user?.role === 'driver' ? 'Repartidor' :
                        user?.role === 'vendor' ? 'Vendedor' : 'Mi Cuenta'}
                     </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-brand-primary transition-colors hidden md:block" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const authForm = document.getElementById('auth-form');
                    if (authForm) authForm.scrollIntoView({ behavior: 'smooth' });
                    else navigate('/');
                  }}
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                >
                  <User size={14} />
                  Iniciar Sesión
                </button>
              </div>
            )}
            
            <button 
              className="lg:hidden p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-400 active:scale-90 transition-all" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
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
            className="absolute top-full left-0 w-full bg-[#020617]/98 backdrop-blur-3xl border-b border-white/5 overflow-hidden lg:hidden shadow-2xl z-[100]"
          >
            <div className="p-8 space-y-8">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  name="search" 
                  type="text" 
                  placeholder="¿Qué buscas hoy?" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest outline-none text-white focus:border-brand-primary/40 transition-all" 
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </form>

              <div className="grid grid-cols-2 gap-4">
                <Link to="/catalogo" className="p-5 bg-white/5 rounded-3xl flex flex-col gap-3 border border-white/5 hover:border-brand-primary/20 transition-all">
                  <Search className="w-5 h-5 text-brand-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Catálogo</span>
                </Link>
                {isAuthenticated && (
                  <Link to="/cuenta" className="p-5 bg-white/5 rounded-3xl flex flex-col gap-3 border border-white/5 hover:border-brand-primary/20 transition-all">
                    <User className="w-5 h-5 text-brand-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mi Perfil</span>
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
