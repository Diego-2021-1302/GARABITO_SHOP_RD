import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Bell,
  LogOut,
  Tag,
  Truck,
  Boxes,
  FileText,
  ChevronRight,
  Briefcase,
  ClipboardList,
  Award,
  Wallet,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/common/ThemeToggle';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user } = useAuthStore();
  const { data: settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const storeName = settings?.general.storeName || 'Garabito Shop';

  const hasPermission = (permissionId: string) => {
    if (!user) return false;
    // Si no hay permisos definidos (usuario antiguo o super admin), tiene acceso total
    if (!user.permissions || user.permissions.length === 0) return true;
    return user.permissions.includes(permissionId);
  };

  // Menú organizado por secciones
  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin', permission: 'dashboard' },
        { name: 'Mensajería', icon: <MessageSquare className="w-5 h-5" />, path: '/admin/mensajeria', permission: 'messaging' },
      ].filter(item => hasPermission(item.permission))
    },
    {
      title: 'Administración del Sitio',
      items: [
        { name: 'Productos', icon: <Package className="w-5 h-5" />, path: '/admin/productos', permission: 'products' },
        { name: 'Categorías', icon: <Tag className="w-5 h-5" />, path: '/admin/categorias', permission: 'products' },
        { name: 'Marcas', icon: <Award className="w-5 h-5" />, path: '/admin/marcas', permission: 'products' },
        { name: 'Inventario', icon: <Boxes className="w-5 h-5" />, path: '/admin/inventario', permission: 'inventory' },
        { name: 'Proveedores', icon: <Briefcase className="w-5 h-5" />, path: '/admin/proveedores', permission: 'inventory' },
        { name: 'Compras', icon: <ClipboardList className="w-5 h-5" />, path: '/admin/compras', permission: 'inventory' },
        { name: 'Usuarios', icon: <Users className="w-5 h-5" />, path: '/admin/usuarios', permission: 'settings' },
        { name: 'Configuración', icon: <Settings className="w-5 h-5" />, path: '/admin/configuracion', permission: 'settings' },
      ].filter(item => hasPermission(item.permission))
    },
    {
      title: 'Ventas y Clientes',
      items: [
        { name: 'Pedidos', icon: <ShoppingCart className="w-5 h-5" />, path: '/admin/pedidos', permission: 'orders' },
        { name: 'Clientes', icon: <Users className="w-5 h-5" />, path: '/admin/clientes', permission: 'customers' },
        { name: 'Envíos', icon: <Truck className="w-5 h-5" />, path: '/admin/envios', permission: 'shipments' },
      ].filter(item => hasPermission(item.permission))
    }
  ].filter(group => group.items.length > 0);

  // Redirección automática a la primera función habilitada si no tiene permiso de Dashboard
  useEffect(() => {
    if (location.pathname === '/admin' && !hasPermission('dashboard')) {
      const firstAvailableItem = menuGroups.flatMap(group => group.items)[0];
      if (firstAvailableItem && firstAvailableItem.path !== '/admin') {
        navigate(firstAvailableItem.path, { replace: true });
      }
    }
  }, [location.pathname, user, navigate]);

  const currentPage = menuGroups
    .flatMap(group => group.items)
    .find(item => 
      location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
    )?.name || 'Admin';

  const BrandLogo = ({ size = 'small' }: { size?: 'small' | 'large' }) => (
    <div className="flex items-center gap-3 group">
      <img 
        src="/logo.png" 
        alt={storeName} 
        className={`${size === 'large' ? 'w-10 h-10' : 'w-8 h-8'} object-contain transition-transform group-hover:scale-110`} 
      />
      <span className={`${size === 'large' ? 'text-xl' : 'text-base'} font-black tracking-tighter uppercase text-light-text dark:text-dark-text`}>
        {storeName.split(' ')[0]} <span className="text-brand-primary">{storeName.split(' ')[1] || ''}</span>
      </span>
    </div>
  );

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden font-poppins transition-colors duration-500">
      {/* Sidebar - Glassmorphism */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className="relative z-50 glass-effect border-r flex flex-col h-full overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between shrink-0 border-b border-light-border dark:border-white/5 h-20">
          <Link to="/admin">
             <BrandLogo />
          </Link>
          <button className="lg:hidden p-2 text-slate-400 hover:text-brand-primary" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar space-y-8">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                          : 'text-slate-500 hover:bg-light-surface dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      <span className="text-xs font-bold tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-light-border dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-bold">Salir del Panel</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 glass-effect border-b flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="p-2.5 bg-light-surface dark:bg-white/5 rounded-xl text-slate-500 hover:text-brand-primary transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <AnimatePresence mode="wait">
              {!isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <BrandLogo size="large" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2.5 bg-light-surface dark:bg-white/5 rounded-xl text-slate-500 hover:text-brand-primary transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-light-bg dark:ring-dark-bg" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
             >
                <Outlet />
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
