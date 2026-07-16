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
  Search,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/common/ThemeToggle';

const UserLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const { user, logout } = useAuthStore();
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
        { name: 'Tienda', icon: <Home className="w-4 h-4" />, path: '/' },
        { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/cuenta' },
      ]
    },
    {
      title: 'Mi Actividad',
      items: [
        { name: 'Pedidos', icon: <ShoppingBag className="w-4 h-4" />, path: '/cuenta/pedidos' },
        { name: 'Favoritos', icon: <Heart className="w-4 h-4" />, path: '/cuenta/favoritos' },
        { name: 'Mensajes', icon: <MessageSquare className="w-4 h-4" />, path: '/cuenta/chat' },
      ]
    },
    {
      title: 'Cuenta',
      items: [
        { name: 'Direcciones', icon: <MapPin className="w-4 h-4" />, path: '/cuenta/direcciones' },
        { name: 'Ajustes', icon: <Settings className="w-4 h-4" />, path: '/cuenta/configuracion' },
      ]
    }
  ];

  const currentPage = [...menuGroups[0].items, ...menuGroups[1].items, ...menuGroups[2].items]
    .find(item => location.pathname === item.path)?.name || 'Cuenta';

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden font-poppins transition-colors duration-500">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Glassmorphism */}
      <motion.aside 
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : isMobile ? -300 : -280,
          width: 280
        }}
        className="fixed lg:relative z-[70] glass-effect border-r flex flex-col h-full overflow-hidden"
      >
        <div className="p-8 flex items-center justify-between shrink-0 h-24 border-b border-light-border dark:border-white/5">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
             </div>
             <span className="text-sm font-black tracking-tighter uppercase text-light-text dark:text-dark-text">
               GARABITO <span className="text-brand-primary">SHOP</span>
             </span>
          </Link>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar space-y-8">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all relative ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className="text-xs font-bold tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-light-border dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-3.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        <header className="h-24 glass-effect border-b flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="p-3 bg-light-surface dark:bg-white/5 rounded-2xl text-slate-500 hover:text-brand-primary transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-light-text dark:text-dark-text uppercase tracking-tighter">
               {currentPage}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-3 bg-light-surface dark:bg-white/5 rounded-2xl text-slate-500 hover:text-brand-primary transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-white dark:ring-dark-bg" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="max-w-6xl mx-auto"
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
