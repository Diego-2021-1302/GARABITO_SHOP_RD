import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package
} from 'lucide-react';
import { useDashboardStats, useRecentOrders } from '../../hooks/useDashboard';
import { useActiveShipments } from '../../hooks/useShipments';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import DriverTracking from '../../components/common/DriverTracking';
import { Truck } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const hasPermission = (permissionId: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permissionId) || false;
  };

  const { data: statsData, isLoading } = useDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders();
  const { data: activeDeliveries } = useActiveShipments();

  const isDriver = user?.role === 'driver' || user?.role === 'admin' || user?.role === 'staff';

  if (!hasPermission('dashboard')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Acceso Restringido</h2>
        <p className="text-slate-500 dark:text-gray-400 max-w-xs">No tienes permisos para ver las estadísticas globales. Redirigiendo a tus funciones...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { 
      label: 'Ventas del Mes', 
      value: `RD$ ${statsData?.revenue.month.toLocaleString() || 0}`, 
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Pedidos de Hoy', 
      value: statsData?.orders.today.toString() || '0', 
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Total Clientes', 
      value: statsData?.customers.total.toLocaleString() || '0', 
      icon: <Users className="w-5 h-5" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    { 
      label: 'Stock Bajo', 
      value: statsData?.products.low_stock.toString() || '0', 
      icon: <Package className="w-5 h-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ];

  const orderStatuses = [
    { label: 'Pendiente de Pago', key: 'pendiente_pago', color: 'bg-amber-500' },
    { label: 'Comprobante Subido', key: 'comprobante_subido', color: 'bg-blue-500' },
    { label: 'Pago Confirmado', key: 'pago_confirmado', color: 'bg-emerald-500' },
    { label: 'Preparando', key: 'preparando', color: 'bg-purple-500' },
    { label: 'En Camino', key: 'en_camino', color: 'bg-sky-500' },
    { label: 'Entregados', key: 'entregado', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Panel de Control</h1>
        <p className="text-sm text-slate-500 dark:text-gray-400">Resumen general del estado de tu tienda</p>
      </div>

      {/* Driver Active Deliveries Section */}
      {isDriver && activeDeliveries && activeDeliveries.length > 0 && (
        <section className="space-y-6">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8">
            <h2 className="text-xl font-poppins font-black flex items-center gap-3 mb-6">
              <Truck className="w-6 h-6 text-emerald-500" />
              Tus Entregas Activas (Repartidor)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDeliveries.map((shipment: any) => (
                <div key={shipment.id} className="space-y-4">
                  <div className="bg-white dark:bg-dark-surface/40 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-poppins font-black text-slate-800 dark:text-white uppercase tracking-tight">Pedido #{shipment.order?.order_number}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[200px]">
                          {shipment.order?.shipping_address?.sector || 'Sin sector'}, {shipment.order?.shipping_address?.municipio || 'Sin municipio'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/admin/pedidos/${shipment.order_id}`} className="text-[10px] font-black text-brand-primary uppercase hover:underline">Ver Detalle</Link>
                  </div>
                  <DriverTracking shipmentId={shipment.id} orderNumber={shipment.order?.order_number} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-[#0B0F1A] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} dark:bg-white/5`}>
                {stat.icon}
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Order Flow Status indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {orderStatuses.map((status, idx) => (
          <div key={idx} className="bg-white dark:bg-[#0B0F1A] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col items-center text-center">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{status.label}</span>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {statsData?.orders.by_status[status.key] || 0}
                </span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white">Pedidos Recientes</h3>
            <Link to="/admin/pedidos" className="text-[10px] font-black text-brand-primary uppercase hover:underline">Ver todos</Link>
          </div>
          {ordersLoading ? (
            <div className="p-12 text-center text-slate-400">Cargando...</div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">#{order.order_number}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{order.user?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800 dark:text-white">RD$ {Number(order.total).toLocaleString()}</p>
                    <Link to={`/admin/pedidos/${order.id}`} className="text-[10px] font-black text-brand-primary uppercase underline">Detalle</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 dark:text-gray-600">
              <ShoppingBag className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">No hay pedidos registrados recientemente.</p>
            </div>
          )}
        </div>

        {/* Inventory Summary */}
        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Resumen de Almacén</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
              <span className="text-sm text-slate-500 dark:text-gray-400">Total Productos</span>
              <span className="font-bold text-slate-800 dark:text-white">{statsData?.products.total}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
              <span className="text-sm text-slate-500 dark:text-gray-400">Alertas de Stock</span>
              <span className={`font-bold ${statsData?.products.low_stock ? 'text-red-500' : 'text-emerald-500'}`}>
                {statsData?.products.low_stock}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
