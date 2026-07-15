import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut,
  CreditCard,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X,
  Bell,
  Home,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';

const UserLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const { user, logout } = useAuthStore();
  const { data: storeSettings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuGroups = [
    {
      title: 'Navegación',
      items: [
        { name: 'Ir a la Tienda', icon: <Home className="w-5 h-5" />, path: '/' },
        { name: 'Panel Principal', icon: <LayoutDashboard className="w-5 h-5" />, path: '/cuenta' },
      ]
    },
    {
      title: 'Mi Actividad',
      items: [
        { name: 'Mis Pedidos', icon: <ShoppingBag className="w-5 h-5" />, path: '/cuenta/pedidos' },
        { name: 'Favoritos', icon: <Heart className="w-5 h-5" />, path: '/cuenta/favoritos' },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { name: 'Direcciones', icon: <MapPin className="w-5 h-5" />, path: '/cuenta/direcciones' },
        { name: 'Mi Perfil', icon: <Settings className="w-5 h-5" />, path: '/cuenta/configuracion' },
      ]
    }
  ];

  const currentPage = [...menuGroups[0].items, ...menuGroups[1].items, ...menuGroups[2].items]
    .find(item => location.pathname === item.path)?.name || 'Mi Cuenta';

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#020617] overflow-hidden font-poppins selection:bg-brand-primary/30 transition-colors duration-300">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Premium */}
      <motion.aside 
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : isMobile ? -320 : -280,
          width: isMobile ? 300 : 280
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:relative z-[70] bg-white dark:bg-[#0B0F1A] border-r border-slate-200 dark:border-white/5 flex flex-col h-full overflow-hidden shadow-2xl lg:shadow-none transition-colors duration-300`}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between shrink-0 h-24 border-b border-slate-100 dark:border-white/5">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-500">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter uppercase dark:text-white text-slate-800 leading-none">
                  GARABITO <span className="text-brand-primary">SHOP</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  Customer Portal
                </span>
             </div>
          </Link>
          <button className="lg:hidden p-2 text-slate-400 hover:text-brand-primary transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Enhanced User Profile Card */}
        <div className="px-6 py-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
               <UserIcon className="w-32 h-32 text-slate-800 dark:text-white" />
            </div>

            <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-4">
                   <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-brand-primary to-blue-600 p-0.5 shadow-2xl shadow-brand-primary/30 group-hover:rotate-6 transition-transform duration-500">
                      <div className="w-full h-full rounded-[1.9rem] bg-white dark:bg-[#0B0F1A] flex items-center justify-center border-4 border-white dark:border-[#0B0F1A]">
                         <UserIcon className="w-8 h-8 text-slate-400 dark:text-white/20" />
                      </div>
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0B0F1A] flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-3 h-3 text-white" />
                   </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">{user?.name}</h3>
                    <div className="flex items-center justify-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">
                         {user?.role === 'admin' ? 'Elite Admin' : 'Premium Member'}
                       </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar space-y-10">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all relative group ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/25'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-primary'} transition-colors`}>
                         {item.icon}
                      </div>
                      <span className={`text-[13px] uppercase tracking-wider ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>

                      {isActive && (
                        <motion.div
                          layoutId="active-nav-indicator"
                          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all duration-300 group font-black uppercase text-[11px] tracking-widest shadow-sm hover:shadow-lg hover:shadow-red-500/20"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Header Enhanced */}
        <header className="h-24 bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="p-3 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all group"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className={`w-6 h-6 group-hover:scale-110 transition-transform ${isSidebarOpen ? 'rotate-90' : ''}`} />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                 <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                    {currentPage}
                 </h2>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Gestión Integral de Cuenta
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
               <input
                  type="text"
                  placeholder="Buscar en mi cuenta..."
                  className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all w-64"
               />
            </div>

            <button className="relative p-3 text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl transition-all hover:bg-brand-primary hover:text-white group">
              <Bell className="w-5 h-5 group-hover:animate-bounce" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-brand-primary rounded-full border-2 border-white dark:border-[#0B0F1A]" />
            </button>

            <div className="h-10 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block" />

            <button
              onClick={() => navigate('/cuenta/configuracion')}
              className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-brand-primary transition-all overflow-hidden group"
            >
               <UserIcon className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar bg-[#F8FAFC] dark:bg-[#020617] relative">

          {/* Background Decorative Blur */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               className="max-w-7xl mx-auto relative z-10"
             >
                <Outlet />
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
