import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Loader2
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useShipments, useShipmentStats, useUpdateShipment, useActiveShipments } from '../../hooks/useShipments';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import DriverTracking from '../../components/common/DriverTracking';
import { Package } from 'lucide-react';

const AdminShipments: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const addNotification = useNotificationStore(state => state.addNotification);

  const { data: shipmentsData, isLoading } = useShipments({ search: searchTerm });
  const { data: stats } = useShipmentStats();
  const { data: activeDeliveries } = useActiveShipments();
  const updateShipment = useUpdateShipment();

  const isDriver = user?.role === 'driver' || user?.role === 'admin' || user?.role === 'staff';

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-400' },
    shipped: { label: 'Enviado', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500' },
    in_transit: { label: 'En Camino', color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500' },
    delivered: { label: 'Entregado', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' },
    failed: { label: 'Fallido', color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500' },
  };

  const handleStatusUpdate = async (id: string | number, status: string) => {
    try {
      await updateShipment.mutateAsync({ id, data: { status } });
      addNotification('success', 'Estado de envío actualizado');
    } catch (error) {
      addNotification('error', 'Error al actualizar el envío');
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Envíos | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Envíos y Logística</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Monitoreo global de entregas</p>
        </div>
      </div>

      {/* Driver Active Deliveries Section */}
      {isDriver && activeDeliveries && activeDeliveries.length > 0 && (
        <section className="space-y-6">
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] p-8">
            <h2 className="text-xl font-poppins font-black flex items-center gap-3 mb-6">
              <Truck className="w-6 h-6 text-emerald-500" />
              Tus Entregas Activas (Repartidor)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDeliveries.map((shipment: any) => (
                <div key={shipment.id} className="space-y-4">
                  <div className="bg-white dark:bg-brand-dark/40 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-poppins font-black text-slate-800 dark:text-white uppercase tracking-tight">Pedido #{shipment.order?.order_number}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[200px]">
                          {shipment.order?.shipping_address?.sector || 'Sin sector'}, {shipment.order?.shipping_address?.municipio || 'Sin municipio'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DriverTracking shipmentId={shipment.id} orderNumber={shipment.order?.order_number} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'En Camino', count: stats?.in_transit || 0, icon: <Truck className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Pendientes', count: stats?.pending || 0, icon: <Clock className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50' },
          { label: 'Entregados Hoy', count: stats?.delivered_today || 0, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50' },
          { label: 'Incidencias', count: stats?.failed || 0, icon: <AlertCircle className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0B0F1A] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} dark:bg-white/5`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.count}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar guía o pedido..." 
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Guía / Pedido</th>
                  <th className="px-6 py-4">Transportista</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Estado Envío</th>
                  <th className="px-6 py-4 text-right">Gestionar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {shipmentsData?.data?.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay envíos registrados.</td></tr>
                )}
                {shipmentsData?.data?.map((shp: any) => (
                  <tr key={shp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <p className="font-bold text-brand-primary">{shp.tracking_number || 'Sin Guía'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">#{shp.order?.order_number}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-gray-300 font-medium">{shp.carrier || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-gray-300 font-medium">{shp.order?.user?.name}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={shp.status}
                        onChange={(e) => handleStatusUpdate(shp.id, e.target.value)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase outline-none border-none cursor-pointer appearance-none ${statusMap[shp.status]?.color || 'bg-slate-100'}`}
                      >
                        {Object.entries(statusMap).map(([val, data]) => (
                          <option key={val} value={val} className="bg-white text-slate-800">{data.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/pedidos/${shp.order_id}`)}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        title="Ir al Pedido"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShipments;
