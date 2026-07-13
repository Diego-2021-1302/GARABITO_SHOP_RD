import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Zap, ShoppingBag, Heart, LogIn, UserPlus, 
  Lock, Eye, EyeOff, Mail, ChevronDown, ArrowUpDown, 
  SlidersHorizontal, X, Check, TrendingUp, ArrowRight,
  User, Phone, ShieldCheck, Loader2
} from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { useNotificationStore } from '../store/useNotificationStore';
import { authService } from '../api/auth';
import SEO from '../components/common/SEO';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';

// ─── Componentes Fieles al Diseño de Exploración ──────────────────────────────

const GuestBanner = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, setAuth, isLoading } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'login') {
        await login(email, password);
        addNotification('success', 'Welcome back!');
        const user = useAuthStore.getState().user;
        if (['admin', 'driver', 'vendor'].includes(user?.role || '')) navigate('/admin');
        else navigate('/');
      } else {
        if (password !== confirmPassword) {
          addNotification('error', 'Passwords do not match');
          return;
        }
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
        const response = await authService.register({ name, email, phone, password, password_confirmation: confirmPassword, role });
        setAuth(response.user, response.token);
        addNotification('success', 'Welcome to the family!');
        if (['admin', 'driver', 'vendor'].includes(response.user.role)) navigate('/admin');
        else navigate('/');
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black py-20 px-6">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-brand-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="noise-bg absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="flex flex-col gap-8 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 self-center lg:self-start px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <Zap size={14} className="text-brand-primary fill-brand-primary" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/80">Innovation & Style</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter"
          >
            Smarter <br />
            <span className="text-gradient">Technology.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-lg leading-relaxed font-medium"
          >
            Premium hardware and accessories curated for those who demand performance.
            <span className="text-white"> Join the next generation of tech enthusiasts.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4"
          >
            <Link to="/catalogo" className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-2xl">
              Shop Now
            </Link>
            <button onClick={() => {
              const formElement = document.getElementById('auth-form');
              formElement?.scrollIntoView({ behavior: 'smooth' });
            }} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Unified Auth Card */}
        <div id="auth-form" className="w-full max-w-md mx-auto lg:ml-auto relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-brand-primary/30 to-blue-600/30 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-50 transition duration-1000" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass rounded-[3rem] p-10 sm:p-12 overflow-hidden"
          >
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-primary/40 mb-6 rotate-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-2">
                Exclusive Experience
              </p>
            </div>

            <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'login' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'register' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               {activeTab === 'register' && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <input
                       type="text"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary/50 transition-all"
                       placeholder="Name"
                     />
                   </div>
                   <div className="space-y-1.5">
                     <input
                       type="text"
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary/50 transition-all"
                       placeholder="Phone"
                     />
                   </div>
                 </div>
               )}

               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary/50 transition-all"
                 placeholder="Email Address"
               />

               <div className="relative">
                 <input
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary/50 transition-all pr-12"
                   placeholder="Password"
                 />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
               </div>

               {activeTab === 'register' && (
                 <input
                   type={showPassword ? 'text' : 'password'}
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary/50 transition-all"
                   placeholder="Confirm Password"
                 />
               )}

               <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-premium shadow-brand-primary/20 flex items-center justify-center gap-3 mt-4"
               >
                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : activeTab === 'login' ? 'Access Portal' : 'Join Now'}
                 {!isLoading && <ArrowRight size={16} />}
               </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('featured');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: products, isLoading } = useProducts({ 
    category: selectedCategory === 'Todos' ? undefined : selectedCategory,
    sort: sortBy,
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const availableCategories = useMemo(() => {
    if (!categories) return ['Todos'];
    return ['Todos', ...categories.map(c => c.name)];
  }, [categories]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('Todos');
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
  };

  return (
    <div className="bg-[#020617] text-white min-h-screen font-poppins selection:bg-brand-primary/30 relative overflow-hidden">
      <SEO title="Bienvenidos | Garabito Shop RD" />
      
      {!isAuthenticated ? <GuestBanner /> : (
        <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-r from-brand-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <p className="text-[10px] font-black tracking-widest uppercase text-brand-primary mb-1">Bienvenido de vuelta</p>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Explorar catálogo</h1>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* --- Catálogo Principal con Filtros --- */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Explorar Catálogo</h2>
            {!isAuthenticated && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                <Eye size={12} /> Solo lectura
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? 'bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
              <span className="text-white">{isLoading ? '...' : (products?.length || 0)}</span> productos
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  selectedBrands.length > 0 || priceRange.min || priceRange.max
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                }`}
              >
                <SlidersHorizontal size={14} /> Filtros
              </button>
              <div className="relative flex-1 sm:flex-none">
                <button 
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                >
                  <ArrowUpDown size={14} />
                  {sortBy === 'featured' ? 'Destacados' : 'Ordenar'}
                  <ChevronDown size={12} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-3xl z-50 overflow-hidden">
                      {[
                        { label: 'Destacados', value: 'featured' },
                        { label: 'Precio: Menor a Mayor', value: 'price_asc' },
                        { label: 'Precio: Mayor a Menor', value: 'price_desc' },
                        { label: 'Nuevos', value: 'newest' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            sortBy === option.value ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {isLoading ? (
              <ProductGridSkeleton count={10} />
            ) : (
              products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          
          {!isLoading && products?.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                <Search size={32} className="text-gray-700" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sin resultados</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">No encontramos productos que coincidan con tus filtros actuales.</p>
              <button 
                onClick={clearFilters}
                className="mt-8 px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtros Lateral */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#020617] border-l border-white/10 z-[70] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Filtrar</h3>
                </div>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                {/* Marcas */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Marcas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {brands?.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.name)}
                        className={`px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border text-left ${
                          selectedBrands.includes(brand.name)
                          ? 'bg-brand-primary border-brand-primary text-white'
                          : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rango de Precio */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rango de Precio</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-600">$</span>
                      <input 
                        type="number" 
                        placeholder="MIN"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-7 pr-3 text-[10px] font-bold outline-none focus:border-brand-primary/50 transition-colors"
                      />
                    </div>
                    <div className="w-2 h-[1px] bg-white/10" />
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-600">$</span>
                      <input 
                        type="number" 
                        placeholder="MAX"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-7 pr-3 text-[10px] font-bold outline-none focus:border-brand-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-[#0f172a]/30">
                <div className="flex gap-3">
                  <button 
                    onClick={clearFilters}
                    className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Limpiar
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-[2] px-4 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
