import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, MapPin, CreditCard, ChevronRight, Package, Clock, Tag, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useUserOrders, useUserStats } from '../../hooks/useUserAccount';
import { useActiveShipments } from '../../hooks/useShipments';
import DriverTracking from '../../components/common/DriverTracking';

const statusLabels: Record<string, string> = {
  'pendiente_pago': 'Pendiente de Pago',
  'comprobante_enviado': 'Comprobante Enviado',
  'pago_confirmado': 'Pago Confirmado',
  'preparando': 'Preparando',
  'listo_envio': 'Listo para Envío',
  'en_camino': 'En Camino',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado',
};

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: orders, isLoading: ordersLoading } = useUserOrders({ limit: 3 });
  const { data: activeDeliveries, isLoading: deliveriesLoading } = useActiveShipments();

  const isDriver = user?.role === 'driver' || user?.role === 'admin';

  const displayStats = [
    { 
      name: 'Pedidos Realizados', 
      value: stats?.ordersCount || 0, 
      icon: <ShoppingBag className="w-5 h-5" />, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'En Favoritos', 
      value: wishlistCount, 
      icon: <Heart className="w-5 h-5" />, 
      color: 'bg-pink-500' 
    },
    { 
      name: 'Direcciones', 
      value: stats?.addressesCount || 0, 
      icon: <MapPin className="w-5 h-5" />, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Cupones Disponibles', 
      value: stats?.couponsCount || 0, 
      icon: <Tag className="w-5 h-5" />, 
      color: 'bg-orange-500' 
    },
  ];

  const recentOrders = orders?.data || orders || [];
  const nextOrder = recentOrders.find((o: any) => !['entregado', 'cancelado'].includes(o.status));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-poppins font-black text-light-text dark:text-dark-text mb-2">
          ¡Hola, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 font-medium">
          Bienvenido a tu panel de control. Aquí puedes gestionar tus pedidos y cuenta.
        </p>
      </header>

      {/* Driver Active Deliveries Section */}
      {isDriver && activeDeliveries && activeDeliveries.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-poppins font-black flex items-center gap-3 px-2">
            <Truck className="w-6 h-6 text-emerald-500" />
            Entregas Activas (Repartidor)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDeliveries.map((shipment: any) => (
              <div key={shipment.id} className="space-y-4">
                 <div className="bg-white dark:bg-dark-surface/40 border border-gray-100 dark:border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                          <Package className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-poppins font-black text-light-text dark:text-dark-text">Pedido #{shipment.order?.order_number}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[200px]">
                            {shipment.order?.shipping_address?.sector}, {shipment.order?.shipping_address?.municipio}
                          </p>
                       </div>
                    </div>
                    <Link to={`/cuenta/pedidos/${shipment.order_id}`} className="text-[10px] font-black text-brand-primary uppercase hover:underline">Ver Pedido</Link>
                 </div>
                 <DriverTracking shipmentId={shipment.id} orderNumber={shipment.order?.order_number} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats Grid - Diseño exacto a la referencia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {displayStats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-dark-surface/40 border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl text-white ${stat.color} flex items-center justify-center shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.name}</p>
              <p className="text-3xl font-poppins font-black text-light-text dark:text-dark-text">
                {statsLoading ? '...' : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Orders List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-poppins font-black flex items-center gap-3">
              <Package className="w-6 h-6 text-brand-primary" />
              Pedidos Recientes
            </h2>
            <Link to="/cuenta/pedidos" className="text-sm font-black text-brand-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {ordersLoading ? (
               <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Cargando tus pedidos...</div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div key={order.id} className="bg-white dark:bg-dark-surface/40 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-6 hover:border-brand-primary/30 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                      <ShoppingBag className="w-6 h-6 text-gray-400 group-hover:text-brand-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-poppins font-black text-light-text dark:text-dark-text">#{order.order_number || order.id}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
                        {new Date(order.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length || 0} artículos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="font-black text-xl text-brand-primary">RD$ {Number(order.total).toLocaleString()}</p>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        ['entregado', 'pago_confirmado'].includes(order.status)
                          ? 'bg-brand-success/10 text-brand-success' 
                          : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <Link to={`/cuenta/pedidos/${order.id}`} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-dark-surface/40 border-2 border-dashed border-gray-100 dark:border-white/5 p-12 rounded-[2.5rem] text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">Aún no has realizado ningún pedido.</p>
                <Link to="/catalogo" className="text-brand-primary font-black text-sm hover:underline mt-2 inline-block">¡Empieza a comprar ahora!</Link>
              </div>
            )}
          </div>
        </div>

        {/* Support & Next Delivery Side Cards */}
        <div className="space-y-8">
          <h2 className="text-2xl font-poppins font-black flex items-center gap-3 px-2">
            <Clock className="w-6 h-6 text-brand-primary" />
            Soporte Directo
          </h2>
          
          <div className="bg-brand-primary dark:bg-brand-primary text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-brand-primary/20 group">
             <div className="relative z-10">
                <h3 className="font-poppins font-black text-xl mb-4 leading-tight">¿Necesitas ayuda con un pedido?</h3>
                <p className="text-gray-300 text-sm mb-8 leading-relaxed font-medium">Estamos disponibles 24/7 para resolver cualquier inconveniente o duda que tengas.</p>
                <button className="w-full bg-white text-brand-primary py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl">
                  Hablar con un asesor
                </button>
             </div>
             <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <ShoppingBag className="w-40 h-40" />
             </div>
          </div>

          <div className="bg-white dark:bg-dark-surface/40 border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="font-poppins font-black text-light-text dark:text-dark-text mb-6">Próxima Entrega</h3>
            {nextOrder ? (
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>En progreso</span>
                  <span className="text-brand-primary">70%</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-brand-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Tu pedido <span className="font-black text-light-text dark:text-dark-text">#{nextOrder.order_number}</span> está siendo procesado y llegará pronto.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Clock className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 font-bold italic">No hay entregas pendientes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
