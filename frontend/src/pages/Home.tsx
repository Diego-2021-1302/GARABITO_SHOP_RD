import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Zap, ShoppingBag, Heart,
  Lock, Eye, EyeOff, Mail, ChevronDown, ArrowUpDown, 
  SlidersHorizontal, X, Check, TrendingUp, ArrowRight,
  User, Phone, ShieldCheck, Loader2, Compass, Sparkles, Layers,
  Smartphone, CreditCard, MapPin, CheckCircle2
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
import { getAssetUrl } from '../utils/asset';

// ─── Componentes de Diseño Premium ──────────────────────────────

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
        addNotification('success', '¡Bienvenido de nuevo!');
        const user = useAuthStore.getState().user;
        if (['admin', 'driver', 'vendor'].includes(user?.role || '')) navigate('/admin');
        else navigate('/');
      } else {
        if (password !== confirmPassword) {
          addNotification('error', 'Las contraseñas no coinciden');
          return;
        }
        const response = await authService.register({ name, email, phone, password, password_confirmation: confirmPassword, role: 'customer' });
        setAuth(response.user, response.token);
        addNotification('success', '¡Bienvenido a la familia!');
        if (['admin', 'driver', 'vendor'].includes(response.user.role)) navigate('/admin');
        else navigate('/');
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'La acción ha fallado');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-12 lg:gap-20 items-center">
        <div className="flex flex-col gap-8 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-3 self-center lg:self-start px-4 py-2 rounded-full border border-light-border dark:border-white/5 bg-light-surface dark:bg-white/5 backdrop-blur-md">
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-gray-400">Premium Tech Experience</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-light-text dark:text-white leading-[0.95] tracking-tighter">
              ¡Bienvenidos a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-400 to-indigo-500">Garabito Shop!</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Somos tu tienda online premium de tecnología en Santo Domingo. Nos enfocamos exclusivamente en ofrecerte hardware de nueva generación con total comodidad y seguridad. Operamos de forma 100% digital, facilitando tus compras mediante transferencia bancaria y garantizando entregas rápidas directamente hasta tu puerta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center lg:items-start gap-2 p-4 bg-light-surface dark:bg-white/5 rounded-2xl border border-light-border dark:border-white/5">
              <Smartphone size={20} className="text-brand-primary" />
              <h4 className="text-[10px] font-black uppercase text-light-text dark:text-white tracking-widest">100% Digital</h4>
              <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase leading-tight">Compra desde tu hogar o taller de trabajo.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2 p-4 bg-light-surface dark:bg-white/5 rounded-2xl border border-light-border dark:border-white/5">
              <CreditCard size={20} className="text-brand-primary" />
              <h4 className="text-[10px] font-black uppercase text-light-text dark:text-white tracking-widest">Pagos Seguros</h4>
              <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase leading-tight">Transacciones vía transferencia bancaria.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2 p-4 bg-light-surface dark:bg-white/5 rounded-2xl border border-light-border dark:border-white/5">
              <MapPin size={20} className="text-brand-primary" />
              <h4 className="text-[10px] font-black uppercase text-light-text dark:text-white tracking-widest">Envíos Locales</h4>
              <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase leading-tight">Entregas exclusivas en Santo Domingo.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <button
              onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-4 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20"
            >
              Comenzar Ahora
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card de Autenticación Premium */}
        <div id="auth-form" className="w-full max-w-[420px] mx-auto order-1 lg:order-2 relative lg:ml-auto">
          <div className="absolute -inset-2 bg-gradient-to-br from-brand-primary/30 to-blue-500/20 rounded-[3rem] blur-3xl opacity-40 animate-pulse" />
          
          <div className="relative glass-card p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="relative group mb-6">
                <div className="absolute -inset-4 bg-brand-primary/20 rounded-full blur-xl group-hover:bg-brand-primary/40 transition-all duration-500" />
                <div className="relative w-20 h-20 bg-black border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6 duration-500">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-light-text dark:text-white tracking-tight uppercase">
                {activeTab === 'login' ? 'Bienvenido' : 'Únete Ahora'}
              </h2>
              <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.4em] mt-3">
                Garabito Shop RD
              </p>
            </div>

            <div className="flex p-1 bg-light-surface dark:bg-black/40 rounded-2xl mb-8 border border-light-border dark:border-white/5">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'login' ? 'Entrar' : 'Registro'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-4">
                   {activeTab === 'register' && (
                     <div className="grid grid-cols-2 gap-3">
                       <input
                         type="text"
                         required
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="input-minimal"
                         placeholder="Nombre"
                       />
                       <input
                         type="text"
                         required
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="input-minimal"
                         placeholder="WhatsApp"
                       />
                     </div>
                   )}

                   <div className="relative group">
                     <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
                     <input
                       type="email"
                       required
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="input-minimal pl-12"
                       placeholder="Email"
                     />
                   </div>

                   <div className="relative group">
                     <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
                     <input
                       type={showPassword ? 'text' : 'password'}
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="input-minimal pl-12"
                       placeholder="Contraseña"
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                   </div>

                   {activeTab === 'register' && (
                     <div className="relative group">
                       <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
                       <input
                         type={showPassword ? 'text' : 'password'}
                         required
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         className="input-minimal pl-12"
                         placeholder="Confirmar Contraseña"
                       />
                     </div>
                   )}
                 </div>

               <button
                 type="submit"
                 disabled={isLoading}
                 className="group w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 mt-4"
               >
                 {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>
                     {activeTab === 'login' ? 'Acceder al Portal' : 'Finalizar Registro'}
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('price_asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'brand' | 'category'>('all');

  const { data: products, isLoading } = useProducts({ 
    category: selectedCategory === 'Todos' ? undefined : selectedCategory,
    sort: sortBy,
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
  });

  const { data: categoriesData } = useCategories();
  const categories = useMemo(() => Array.isArray(categoriesData) ? categoriesData : [], [categoriesData]);

  const { data: brandsData } = useBrands();
  const brands = useMemo(() => Array.isArray(brandsData) ? brandsData : (brandsData as any)?.data || [], [brandsData]);

  const availableCategories = useMemo(() => {
    const defaultCats = ['Todos'];
    if (!Array.isArray(categories)) return defaultCats;
    return defaultCats.concat(categories.map((c: any) => c?.name).filter(Boolean));
  }, [categories]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('Todos');
    setSelectedBrands([]);
    setFilterType('all');
  };

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen font-poppins selection:bg-brand-primary/30 relative transition-colors duration-500">
      <SEO title="Elite Hardware Store | Garabito Shop RD" />
      
      {/* Texture & Glow Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-brand-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      {!isAuthenticated ? (
        <React.Suspense fallback={<div className="min-h-screen bg-dark-bg" />}>
          <GuestBanner />
        </React.Suspense>
      ) : (
        <main className="max-w-7xl mx-auto px-6 relative z-10 pt-4 pb-24">
          <div className="flex flex-col gap-16">

            {/* --- Header del Catálogo (UX Minimalista) --- */}
            <div className="flex flex-col gap-8">
               <div className="flex items-end justify-between">
                  <div className="pl-6 relative">
                    <div className="absolute -left-0 top-0 bottom-0 w-1.5 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-light-text dark:text-white leading-none">
                      <span className="text-brand-dark">catálogo</span>
                    </h2>
                  </div>

                  {(selectedCategory !== 'Todos' || selectedBrands.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-error hover:underline transition-all"
                    >
                      Limpiar Filtros
                    </button>
                  )}
               </div>

               <div className="flex flex-col gap-4 relative">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setFilterType(filterType === 'category' ? 'all' : 'category'); }}
                      className={`flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-glass-light border-2 ${
                        filterType === 'category' || selectedCategory !== 'Todos'
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary dark:text-white'
                        : 'bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 text-light-text dark:text-white'
                      }`}
                    >
                      <Layers size={16} className={filterType === 'category' || selectedCategory !== 'Todos' ? 'text-brand-primary dark:text-white' : 'text-brand-primary'} />
                      {selectedCategory === 'Todos' ? 'Categoría' : selectedCategory}
                    </button>
                    <button
                      onClick={() => { setFilterType(filterType === 'brand' ? 'all' : 'brand'); }}
                      className={`flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-glass-light border-2 ${
                        filterType === 'brand' || selectedBrands.length > 0
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary dark:text-white'
                        : 'bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 text-light-text dark:text-white'
                      }`}
                    >
                      <Compass size={16} className={filterType === 'brand' || selectedBrands.length > 0 ? 'text-brand-primary dark:text-white' : 'text-brand-primary'} />
                      {selectedBrands.length === 0
                        ? 'Marca'
                        : selectedBrands.length === 1
                          ? selectedBrands[0]
                          : `${selectedBrands.length} Marcas`}
                    </button>
                  </div>

                  {/* Listado Desplegable Inline */}
                  <AnimatePresence>
                    {filterType !== 'all' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-4 z-[50] p-6 bg-white dark:bg-[#0B0F1A] border border-light-border dark:border-white/10 rounded-[2rem] shadow-2xl space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar"
                      >
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                             {filterType === 'category' ? 'Filtrar Categoría' : 'Filtrar Marca'}
                           </h4>
                           <button onClick={() => setFilterType('all')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
                              <X size={14} className="text-slate-400" />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {filterType === 'category' ? (
                            availableCategories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setFilterType('all');
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                  selectedCategory === cat
                                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5'
                                }`}
                              >
                                {cat}
                                {selectedCategory === cat && <CheckCircle2 size={14} />}
                              </button>
                            ))
                          ) : (
                            brands.map((brand: any) => (
                              <button
                                key={brand.id}
                                onClick={() => {
                                  toggleBrand(brand.name);
                                  setFilterType('all');
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                  selectedBrands.includes(brand.name)
                                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5'
                                }`}
                              >
                                {brand.name}
                                {selectedBrands.includes(brand.name) && <CheckCircle2 size={14} />}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Grid de Productos - Diseño Compacto para Móvil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 items-stretch">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <ProductGridSkeleton count={10} />
                ) : (
                  products?.map((product: any, idx: number) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      className="flex"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {!isLoading && products?.length === 0 && (
              <div className="py-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem]">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-[3rem] bg-brand-primary/5 mb-8 border border-brand-primary/10">
                  <Search size={48} className="text-brand-primary opacity-30" />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Sin Coincidencias</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">Ajusta los filtros o cambia los términos de búsqueda para encontrar lo que necesitas.</p>
                <button
                  onClick={clearFilters}
                  className="mt-12 px-12 py-5 bg-brand-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
