import React, { useState } from 'react';
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
  Home
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';

const UserLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const { data: storeSettings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const storeName = storeSettings?.general.storeName || 'Garabito Shop';

  const menuGroups = [
    {
      title: 'Navegación',
      items: [
        { name: 'Ir a la Tienda', icon: <Home className="w-5 h-5" />, path: '/' },
        { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/cuenta' },
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
        { name: 'Métodos de Pago', icon: <CreditCard className="w-5 h-5" />, path: '/cuenta/pagos' },
        { name: 'Perfil', icon: <Settings className="w-5 h-5" />, path: '/cuenta/configuracion' },
      ]
    }
  ];

  const currentPage = [...menuGroups[0].items, ...menuGroups[1].items, ...menuGroups[2].items]
    .find(item => location.pathname === item.path)?.name || 'Mi Cuenta';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] overflow-hidden font-poppins transition-colors duration-300">
      
      {/* Sidebar - Identico al Admin */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className="relative z-50 bg-white dark:bg-[#0B0F1A] border-r border-slate-200 dark:border-white/5 flex flex-col h-full overflow-hidden transition-all duration-300 shadow-xl"
      >
        <div className="p-6 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-white/5 h-20">
          <Link to="/" className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
             <span className="text-base font-black tracking-tighter uppercase dark:text-white text-slate-800">
                GARABITO <span className="text-brand-primary">SHOP</span>
             </span>
          </Link>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Summary in Sidebar */}
        <div className="px-6 py-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20">
                    <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate uppercase">{user?.name}</p>
                    <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">
                      {user?.role === 'admin' ? 'Administrador' :
                       user?.role === 'driver' ? 'Repartidor' :
                       user?.role === 'vendor' ? 'Vendedor' : 'Cliente Premium'}
                    </p>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={group.title} className={idx > 0 ? 'mt-8' : ''}>
              <h3 className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                          : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-semibold">{item.name}</span>
                      {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white dark:bg-[#0B0F1A]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 lg:px-8 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="p-2 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-6 w-[2px] bg-brand-primary rounded-full hidden sm:block" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-white dark:border-[#020617]" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-slate-50 dark:bg-[#020617]">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="max-w-7xl mx-auto"
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
