import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Eye, 
  Loader2,
  Filter,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useNotificationStore } from '../../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

const statusStyles: Record<string, string> = {
  'pendiente_pago': 'bg-amber-50 text-amber-600 border-amber-100',
  'comprobante_subido': 'bg-blue-50 text-blue-600 border-blue-100',
  'pago_confirmado': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'preparando': 'bg-purple-50 text-purple-600 border-purple-100',
  'listo_envio': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'en_camino': 'bg-sky-50 text-sky-600 border-sky-100',
  'entregado': 'bg-green-50 text-green-600 border-green-100',
  'cancelado': 'bg-red-50 text-red-600 border-red-100',
};

const statusLabels: Record<string, string> = {
  'pendiente_pago': 'Pendiente de Pago',
  'comprobante_subido': 'Comprobante Subido',
  'pago_confirmado': 'Pago Confirmado',
  'preparando': 'Preparando',
  'listo_envio': 'Listo para Envío',
  'en_camino': 'En Camino',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado',
};

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const addNotification = useNotificationStore(state => state.addNotification);
  const { data: ordersData, isLoading } = useAdminOrders({ search: searchTerm });
  const updateStatus = useUpdateOrderStatus();

  const handleOpenStatusModal = (order: any) => {
    const next = getNextStatus(order.status);
    if (!next) {
      addNotification('info', 'El pedido ya ha llegado a su estado final.');
      return;
    }
    setSelectedOrder(order);
    setNewStatus(next);
    setStatusComment('');
    setIsStatusModalOpen(true);
  };

  const getNextStatus = (currentStatus: string) => {
    const flow = [
      'pendiente_pago',
      'comprobante_subido',
      'pago_confirmado',
      'preparando',
      'listo_envio',
      'en_camino',
      'entregado'
    ];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === flow.length - 1) return null;
    return flow[currentIndex + 1];
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateStatus.mutateAsync({ 
        id: selectedOrder.id, 
        status: newStatus,
        comment: statusComment 
      });
      addNotification('success', 'Estado actualizado correctamente');
      setIsStatusModalOpen(false);
    } catch (error) {
      addNotification('error', 'Error al actualizar el estado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Control de flujo de ventas y preparación</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente o No. Pedido..." 
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">No. Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {ordersData?.data?.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No hay pedidos registrados.</td></tr>
                )}
                {ordersData?.data?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-gray-300">#{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white">{order.user?.name}</span>
                        <span className="text-[10px] text-slate-400">{order.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">RD$ {Number(order.total).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleOpenStatusModal(order)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border shadow-sm transition-transform active:scale-95 ${statusStyles[order.status] || 'bg-slate-100'}`}
                      >
                        {statusLabels[order.status] || order.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                          title="Ver Detalle y Gestionar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para cambiar estado respetando el flujo */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B0F1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Actualizar Pedido #{selectedOrder?.order_number}</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pasar a Siguiente Estado</label>
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-bold dark:text-white">
                      {getNextStatus(selectedOrder?.status) ? statusLabels[getNextStatus(selectedOrder?.status)!] : 'Flujo completado'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                  </div>

                  {newStatus === 'pago_confirmado' && (
                    <p className="mt-2 text-[10px] text-emerald-600 font-bold">
                      * Al marcar como PAGO CONFIRMADO se descontará el inventario y se generará la factura.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nota del cambio</label>
                  <textarea 
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Ej: El pedido ha sido verificado y está completo..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none dark:text-white min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex gap-3">
                <button 
                  onClick={() => setIsStatusModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateStatus}
                  disabled={updateStatus.isPending}
                  className="flex-1 bg-brand-primary text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cambio'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
