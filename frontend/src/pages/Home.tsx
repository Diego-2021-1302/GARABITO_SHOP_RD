import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Zap, ShoppingBag, Heart, LogIn, UserPlus, 
  Lock, Eye, EyeOff, Mail, ChevronDown, ArrowUpDown, 
  SlidersHorizontal, X, Check, TrendingUp, ArrowRight,
  User, Phone, ShieldCheck, Loader2, Compass
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

// ─── Componentes Fieles al Diseño de Exploración ──────────────────────────────

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-all group">
    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon size={32} className="text-brand-primary" />
    </div>
    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-3">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed font-medium">{description}</p>
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
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
        const response = await authService.register({ name, email, phone, password, password_confirmation: confirmPassword, role });
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="noise-bg absolute inset-0 opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-12 lg:gap-20 items-center">
        {/* ─── Sección de Texto Hero (Bienvenida Sutil) ─── */}
        <div className="flex flex-col gap-6 text-center lg:text-left order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400">Hardware Premium RD</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter"
            >
              Bienvenidos a <br />
              <span className="text-brand-primary">Garabito Shop.</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-gray-400 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            Equipos de alto rendimiento y tecnología de vanguardia seleccionados para mentes innovadoras.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <Link to="/catalogo" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-primary transition-colors">
              Explorar Catálogo
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-primary group-hover:translate-x-1 transition-all">
                <ArrowRight size={14} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ─── Card de Autenticación Premium (Ahora con más espacio) ─── */}
        <div id="auth-form" className="w-full max-w-[400px] mx-auto order-1 lg:order-2 relative lg:ml-auto">
          <div className="absolute -inset-1 bg-gradient-to-br from-brand-primary/40 to-transparent rounded-[2.5rem] blur-2xl opacity-50" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-8 sm:p-12 border border-white/10 shadow-2xl"
          >
            {/* Brillo de borde superior */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

            <div className="flex flex-col items-center mb-8 text-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand-primary/20 rounded-full blur-xl group-hover:bg-brand-primary/30 transition-all" />
                <div className="relative w-20 h-20 bg-[#0B0F1A] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transition-transform hover:rotate-6 duration-500">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">
                {activeTab === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
              </h2>
              <p className="text-[9px] text-brand-primary font-black uppercase tracking-[0.3em] mt-2">
                Experiencia Garabito Shop
              </p>
            </div>

            <div className="flex p-1 bg-black/50 rounded-2xl mb-8 border border-white/5">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                    ? 'bg-brand-primary text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'login' ? 'Ingresar' : 'Registrarse'}
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
                     <div className="grid grid-cols-2 gap-4">
                       <input
                         type="text"
                         required
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-[11px] font-bold text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all"
                         placeholder="Nombre Completo"
                       />
                       <input
                         type="text"
                         required
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-[11px] font-bold text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all"
                         placeholder="Teléfono"
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
                       className="w-full px-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-[11px] font-bold text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all"
                       placeholder="Correo Electrónico"
                     />
                   </div>

                   <div className="relative group">
                     <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
                     <input
                       type={showPassword ? 'text' : 'password'}
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full px-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-[11px] font-bold text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all"
                       placeholder="Contraseña"
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                   </div>

                   {activeTab === 'register' && (
                     <input
                       type={showPassword ? 'text' : 'password'}
                       required
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-[11px] font-bold text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all"
                       placeholder="Confirmar Contraseña"
                     />
                   )}
                 </motion.div>
               </AnimatePresence>

               <button
                 type="submit"
                 disabled={isLoading}
                 className="group w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-3 mt-4"
               >
                 {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>
                     {activeTab === 'login' ? 'Acceder al Portal' : 'Crear mi Cuenta'}
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
               </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Protegido por <span className="text-brand-primary">UNICOMICOPTERO</span>
              </p>
            </div>
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
      
      {!isAuthenticated ? (
        <>
          <GuestBanner />

          {/* Features Section */}
          <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={ShieldCheck}
                title="Garantía Premium"
                description="Todos nuestros equipos cuentan con garantía oficial y soporte técnico especializado local."
              />
              <FeatureCard
                icon={Zap}
                title="Entrega Flash"
                description="Envíos el mismo día en Santo Domingo y entregas rápidas a todo el territorio nacional."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Precios Competitivos"
                description="Importamos directamente para ofrecerte la mejor tecnología al precio más justo del mercado."
              />
            </div>
          </div>
        </>
      ) : (
        <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-r from-brand-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                <Compass size={16} className="text-brand-primary" />
              </div>
              <p className="text-[10px] font-black tracking-widest uppercase text-brand-primary">Descubrimiento</p>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Explora la Colección</h1>
          </div>
        </div>
      )}

      {/* Brands Section */}
      {brands && brands.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
              <h2 className="text-xl font-black uppercase tracking-tight">Marcas Aliadas</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
            {brands.slice(0, 6).map((brand: any) => (
              <div key={brand.id} className="h-12 w-32 flex items-center justify-center">
                {brand.logo_url ? (
                  <img src={getAssetUrl(brand.logo_url)} alt={brand.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xl font-black text-white/40">{brand.name}</span>
                )}
              </div>
            ))}
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
                <ProductCard key={product.id} product={product} showActions={false} />
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
