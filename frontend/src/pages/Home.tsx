import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Zap, ShoppingBag, Heart, LogIn, UserPlus, 
  Lock, Eye, EyeOff, Mail, ChevronDown, ArrowUpDown, 
  SlidersHorizontal, X, Check, TrendingUp, ArrowRight,
  User, Phone, ShieldCheck, Loader2, Compass, Sparkles, Layers,
  Smartphone, CreditCard, MapPin
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

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-8 glass-card backdrop-blur-xl group relative overflow-hidden h-full">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
      <Icon size={32} className="text-brand-primary" />
    </div>
    <h3 className="text-lg font-black uppercase tracking-tight text-light-text dark:text-white mb-3">{title}</h3>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-4">{description}</p>
  </div>
);

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-light-bg dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* ─── Capas de Fondo Dinámicas ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(29,78,216,0.1),transparent_50%)]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-primary/20 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-12 lg:gap-20 items-center">
        <div className="flex flex-col gap-8 text-center lg:text-left order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 self-center lg:self-start px-4 py-2 rounded-full border border-light-border dark:border-white/5 bg-light-surface dark:bg-white/5 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-gray-400">Premium Tech Experience</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-light-text dark:text-white leading-[0.95] tracking-tighter"
            >
              ¡Bienvenidos a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-400 to-indigo-500">Garabito Shop!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Somos tu tienda online premium de tecnología en Santo Domingo. Nos enfocamos exclusivamente en ofrecerte hardware de nueva generación con total comodidad y seguridad. Operamos de forma 100% digital, facilitando tus compras mediante transferencia bancaria y garantizando entregas rápidas directamente hasta tu puerta.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-4"
          >
            <Link to="/catalogo" className="group flex items-center gap-4 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20">
              Explorar Catálogo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Card de Autenticación Premium */}
        <div id="auth-form" className="w-full max-w-[420px] mx-auto order-1 lg:order-2 relative lg:ml-auto">
          <div className="absolute -inset-2 bg-gradient-to-br from-brand-primary/30 to-blue-500/20 rounded-[3rem] blur-3xl opacity-40 animate-pulse" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card p-8 sm:p-12 shadow-2xl"
          >
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
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-4"
                 >
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
                 </motion.div>
               </AnimatePresence>

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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
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
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen font-poppins selection:bg-brand-primary/30 relative transition-colors duration-500">
      <SEO title="Elite Hardware Store | Garabito Shop RD" />
      
      {/* Texture & Glow Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-brand-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      {!isAuthenticated ? (
        <>
          <GuestBanner />
        </>
      ) : (
        <div className="relative pt-20 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 max-w-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                    <Sparkles size={20} className="text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white/90">¡Qué bueno verte de nuevo, {user?.name.split(' ')[0]}!</h2>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-primary/60 leading-none mt-1">Socio Garabito Shop</p>
                  </div>
                </div>

                <h1 className="text-5xl md:text-8xl font-black text-light-text dark:text-white uppercase tracking-tighter leading-[0.9]">
                  Tu próximo <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-400 to-indigo-500">Hardware.</span>
                </h1>

                <p className="text-slate-400 text-sm md:text-xl font-medium leading-relaxed max-w-2xl">
                  Explora nuestra selección premium preparada para llevar tus proyectos al siguiente nivel. Tecnología de punta, directo a tu puerta.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* --- Marcas Marquee - Ultra Premium --- */}
      {brands && brands.length > 0 && (
        <div className="py-20 border-y border-light-border dark:border-white/5 bg-light-surface dark:bg-white/[0.02] overflow-hidden relative group transition-colors duration-500">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-light-bg dark:from-dark-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-light-bg dark:from-dark-bg to-transparent z-10 pointer-events-none" />

          {/* Header Centralizado */}
          <div className="max-w-7xl mx-auto px-6 mb-14">
             <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-1 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]" />
                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Marcas Autorizadas</h2>
             </div>
          </div>

          <div className="flex gap-24 animate-marquee whitespace-nowrap items-center px-6">
            {/* Multiplicamos el array para asegurar que el scroll infinito sea fluido */}
            {[...brands, ...brands, ...brands, ...brands, ...brands].map((brand: any, i) => (
              <div
                key={`${brand.id}-${i}`}
                className="flex items-center justify-center min-w-[120px] md:min-w-[200px] transition-all duration-700 hover:scale-110 group/brand"
              >
                {brand.logo_url ? (
                  <img
                    src={getAssetUrl(brand.logo_url)}
                    alt={brand.name}
                    className="h-8 md:h-12 w-auto object-contain opacity-30 group-hover/brand:opacity-100 grayscale group-hover/brand:grayscale-0 transition-all duration-500 filter brightness-150 group-hover/brand:brightness-100"
                  />
                ) : (
                  <span className="text-xl md:text-3xl font-black text-white/10 tracking-tighter uppercase group-hover/brand:text-brand-primary/40 transition-colors">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="flex flex-col gap-16">

          {/* --- Header del Catálogo (High-End UX) --- */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
             <div className="relative group">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(37,99,235,0.8)] transform group-hover:scale-y-110 transition-transform duration-500" />
                <div className="pl-4 space-y-2">
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-light-text dark:text-white leading-none">
                    Catálogo <br className="md:hidden" />
                    <span className="text-brand-primary/40 group-hover:text-brand-primary/60 transition-colors">Elite.</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                      Disponibles: <span className="text-white">{(products?.length || 0)}</span> Unidades
                    </p>
                    <div className="w-1 h-1 rounded-full bg-brand-primary/30" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary animate-pulse">Live stock</p>
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-2 md:gap-4 w-full lg:w-auto">
                {/* Botón Filtros Moderno - Optimizado para móvil */}
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className={`flex-1 lg:flex-none group relative flex items-center justify-center gap-3 px-4 md:px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all overflow-hidden ${
                    selectedBrands.length > 0 || priceRange.min || priceRange.max
                    ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/40 scale-[1.02] md:scale-105'
                    : 'bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 text-slate-400 hover:text-white hover:border-brand-primary/30'
                  }`}
                >
                  <SlidersHorizontal size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="whitespace-nowrap">Filtros</span>
                  { (selectedBrands.length > 0 || priceRange.min || priceRange.max) && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  )}
                </button>

                {/* Selector de Ordenamiento Premium - Bottom Sheet en móvil */}
                <div className="flex-1 lg:flex-none relative group">
                   <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="w-full flex items-center justify-center gap-3 px-4 md:px-8 py-4 bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400 hover:text-white hover:border-brand-primary/30 transition-all"
                  >
                    <ArrowUpDown size={14} />
                    <span className="whitespace-nowrap">{sortBy === 'featured' ? 'Orden' : sortBy === 'price_asc' ? 'Menor $' : sortBy === 'price_desc' ? 'Mayor $' : 'Nuevos'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-500 ${showSortMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showSortMenu && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm lg:hidden"
                          onClick={() => setShowSortMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40 bg-transparent hidden lg:block"
                          onClick={() => setShowSortMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 100 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="fixed inset-x-0 bottom-0 lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-4 w-full lg:w-72 bg-[#0B0F1A] lg:bg-[#0B0F1A]/95 backdrop-blur-3xl border-t lg:border border-white/10 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)] lg:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-[160] overflow-hidden"
                        >
                          <div className="p-6 lg:p-2">
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 lg:hidden" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-4 px-4 lg:hidden text-center">Ordenar Selección</h4>

                            {[
                              { label: 'Recomendaciones Elite', value: 'featured', icon: <Sparkles size={14} /> },
                              { label: 'Precio: Bajo a Alto', value: 'price_asc', icon: <TrendingUp size={14} className="rotate-180" /> },
                              { label: 'Precio: Alto a Bajo', value: 'price_desc', icon: <TrendingUp size={14} /> },
                              { label: 'Nuevos Lanzamientos', value: 'newest', icon: <Zap size={14} /> }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSortBy(option.value);
                                  setShowSortMenu(false);
                                }}
                                className={`w-full flex items-center justify-between px-6 py-5 lg:py-4 rounded-2xl lg:rounded-xl text-[11px] lg:text-[10px] font-bold uppercase tracking-widest transition-all mb-2 last:mb-0 ${
                                  sortBy === option.value
                                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <span>{option.label}</span>
                                {option.icon}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </div>

          {/* Categorías Scroller (Sticky & Interactive) */}
          <div className="sticky top-[72px] md:top-[90px] z-[40] -mx-6 px-6 py-4 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-3xl border-y border-light-border dark:border-white/5 shadow-2xl overflow-hidden transition-colors duration-500">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-light-bg dark:from-dark-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-light-bg dark:from-dark-bg to-transparent z-10 pointer-events-none" />

            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide snap-x px-10">
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap snap-start relative group ${
                    selectedCategory === cat
                      ? 'bg-brand-primary text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] scale-105'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{cat}</span>
                  {selectedCategory !== cat && (
                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos - Compacto y Cuadrado para Móvil */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8 items-stretch">
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

      {/* --- Cajón de Filtros Lateral --- */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-light-bg dark:bg-dark-surface border-l border-light-border dark:border-white/10 z-[210] flex flex-col shadow-3xl transition-colors duration-500"
            >
              <div className="p-10 border-b border-light-border dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-brand-primary rounded-full" />
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-light-text dark:text-dark-text">Filtros</h3>
                </div>
                <button onClick={() => setIsFilterOpen(false)} className="p-4 bg-light-surface dark:bg-white/5 hover:bg-light-border dark:hover:bg-white/10 rounded-2xl transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-16">
                <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Marcas Premium</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {brands?.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.name)}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                          selectedBrands.includes(brand.name)
                          ? 'bg-brand-primary/10 border-brand-primary text-white'
                          : 'bg-white/5 border-transparent text-slate-500 hover:border-white/10'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-widest">{brand.name}</span>
                        {selectedBrands.includes(brand.name) ? (
                          <div className="w-6 h-6 bg-brand-primary rounded-lg flex items-center justify-center">
                             <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-white/10" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Inversión (RD$)</h4>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="flex-1 bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 rounded-2xl p-6 text-sm font-bold outline-none focus:border-brand-primary/50 transition-all"
                    />
                    <div className="w-4 h-[2px] bg-white/10" />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="flex-1 bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 rounded-2xl p-6 text-sm font-bold outline-none focus:border-brand-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-black/20 flex flex-col gap-4">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-6 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Aplicar Configuración
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full py-5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                >
                  Reiniciar Selección
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
