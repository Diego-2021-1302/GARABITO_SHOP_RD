import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText,
  X,
  Mail,
  MessageSquare,
  Download,
  Eye,
  UserCheck,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAdminOrderDetail, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useDrivers } from '../../hooks/useShipments';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../../utils/asset';
import api from '../../api/axios';

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

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: order, isLoading, error } = useAdminOrderDetail(id);
  const { data: drivers } = useDrivers();
  const updateStatus = useUpdateOrderStatus();
  
  const [lastUpdateText, setLastUpdateText] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [driverId, setDriverId] = useState<number | undefined>(undefined);

  // Default driverId to current user if they are admin, driver or staff
  useEffect(() => {
    if (isUpdatingStatus && !driverId && (newStatus === 'en_camino' || newStatus === 'listo_envio')) {
      if (user && (user.role === 'admin' || user.role === 'driver' || user.role === 'staff')) {
        setDriverId(user.id);
      }
    }
  }, [isUpdatingStatus, newStatus, user]);

  // Efecto para calcular el tiempo transcurrido desde la última actualización de ubicación
  useEffect(() => {
    if (!order?.shipment?.last_location_update) return;

    const updateText = () => {
      const lastUpdate = new Date(order.shipment.last_location_update);
      const diff = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);

      if (diff < 60) setLastUpdateText(`hace ${diff} s`);
      else if (diff < 3600) setLastUpdateText(`hace ${Math.floor(diff / 60)} m`);
      else setLastUpdateText('hace +1h');
    };

    updateText();
    const interval = setInterval(updateText, 10000);
    return () => clearInterval(interval);
  }, [order?.shipment?.last_location_update]);

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
    </div>
  );

  if (error || !order) return (
    <div className="p-10 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pedido no encontrado</h2>
      <button onClick={() => navigate('/admin/pedidos')} className="mt-4 text-brand-primary font-bold">Volver a la lista</button>
    </div>
  );

  const handleUpdateStatus = async () => {
    try {
      await updateStatus.mutateAsync({ 
        id: order.id, 
        status: newStatus, 
        comment: isRejecting ? rejectionReason : comment,
        rejection_reason: isRejecting ? rejectionReason : undefined,
        driver_id: newStatus === 'en_camino' ? driverId : undefined
      });
      addNotification('success', isRejecting ? 'Comprobante rechazado' : 'Estado del pedido actualizado correctamente');
      setIsUpdatingStatus(false);
      setIsRejecting(false);
      setComment('');
      setRejectionReason('');
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleResendInvoice = async () => {
    if (!order) return;
    try {
      await api.post(`/admin/invoices/${order.id}/send-email`);
      addNotification('success', 'Factura reenviada correctamente al cliente.');
    } catch (err) {
      addNotification('error', 'Error al reenviar la factura.');
    }
  };

  const getNextStatus = (currentStatus: string, paymentMethod: string) => {
    // Si es transferencia y está pendiente, el admin debe esperar el comprobante del cliente
    if (paymentMethod === 'transfer' && currentStatus === 'pendiente_pago') {
      return null;
    }

    // Si es efectivo, el admin puede saltar directamente a preparación
    if (paymentMethod === 'cod' && currentStatus === 'pendiente_pago') {
      return 'preparando';
    }

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

    const next = flow[currentIndex + 1];

    // El administrador NO puede marcar como entregado ni pasar a comprobante subido (el sistema lo hace)
    if (next === 'entregado' || next === 'comprobante_subido') return null;

    return next;
  };

  const nextStatusValue = getNextStatus(order.status, order.payment_method);
  const isPaid = order.payment_status === 'completed';

  // Siguiente estado filtrado para el botón principal
  const filteredNextStatus = nextStatusValue;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/pedidos')}
            className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-gray-400 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tighter">Pedido #{order.order_number}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
              Recibido el {new Date(order.created_at).toLocaleString('es-DO')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {isPaid && (
            <button
              onClick={() => window.open(getAssetUrl(order.invoice_pdf_path), '_blank')}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver Factura
            </button>
          )}
          {filteredNextStatus && (
            <button
              onClick={() => {
                setNewStatus(filteredNextStatus);
                setIsUpdatingStatus(true);
              }}
              className="px-6 py-3 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              Pasar a {statusLabels[filteredNextStatus]}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {order.status !== 'cancelado' && order.status !== 'entregado' && (
            <button
              onClick={() => {
                setNewStatus('cancelado');
                setIsUpdatingStatus(true);
              }}
              className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Comprobante Pendiente */}
      {order.status === 'comprobante_subido' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0 group relative">
              {order.payment_proof?.toLowerCase().endsWith('.pdf') ? (
                <FileText className="w-10 h-10 text-white" />
              ) : (
                <img
                  src={getAssetUrl(order.payment_proof)}
                  alt="Comprobante"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Comprobante recibido</h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1">
                Fecha: {order.proof_uploaded_at ? new Date(order.proof_uploaded_at).toLocaleString('es-DO') : 'No disponible'}
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="text-[10px] font-black text-slate-500 uppercase">Banco: <span className="text-slate-800 dark:text-white">{order.issuing_bank}</span></span>
                <span className="text-[10px] font-black text-slate-500 uppercase">Monto: <span className="text-brand-primary">RD$ {Number(order.amount_paid).toLocaleString()}</span></span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={getAssetUrl(order.payment_proof)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
              <Eye className="w-4 h-4" /> Ver Comprobante
            </a>
            <a
              href={getAssetUrl(order.payment_proof)}
              download
              className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Descargar
            </a>

            <div className="h-10 w-[1px] bg-blue-200 dark:bg-white/10 mx-2 hidden md:block" />

            <button
              onClick={() => {
                setNewStatus('pago_confirmado');
                setIsUpdatingStatus(true);
              }}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Aprobar Pago
            </button>
            <button
              onClick={() => {
                setNewStatus('pendiente_pago');
                setIsRejecting(true);
                setIsUpdatingStatus(true);
              }}
              className="flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              <X className="w-4 h-4" /> Rechazar Comprobante
            </button>
          </div>
        </motion.div>
      )}

      {/* Acciones de Factura si está pagado */}
      {isPaid && order.invoice_pdf_path && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-tight">Factura generada y enviada al cliente</p>
          </div>
          <a 
            href={getAssetUrl(order.invoice_pdf_path)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" /> Descargar Factura
          </a>
          <button
            onClick={handleResendInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Mail className="w-4 h-4" /> Reenviar por Correo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detalle de Productos */}
          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Productos Solicitados</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
                    <img
                      src={getAssetUrl(item.product?.images?.[0] || item.product?.image_url)}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 dark:text-white truncate text-sm uppercase tracking-tight">{item.product?.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 dark:text-white">RD$ {Number(item.subtotal).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">RD$ {Number(item.unit_price).toLocaleString()} c/u</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-white">RD$ {Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60">
                <span>Envío</span>
                <span className="text-slate-800 dark:text-white">RD$ {Number(order.shipping_cost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-white/10">
                <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Total Pedido</span>
                <span className="text-3xl font-black text-brand-primary tracking-tighter">RD$ {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Cliente y Seguimiento */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20">
                <User className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{order.user?.name}</h3>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest">{order.user?.email}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dirección de Entrega</p>
                  <p className="text-xs text-slate-600 dark:text-gray-300 font-bold mt-1 leading-relaxed">
                    {order.shipping_address?.address}, {order.shipping_address?.city}<br/>
                    <span className="text-brand-primary">{order.shipping_address?.phone}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CreditCard className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pago</p>
                  <p className="text-xs text-slate-600 dark:text-gray-300 uppercase font-black mt-1">{order.payment_method.replace('_', ' ')}</p>
                  <div className={`mt-2 inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isPaid ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {isPaid ? 'Pagado' : 'Pendiente'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logística */}
          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Información de Envío</h2>
            </div>
            {order.shipment ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                   <div className="flex justify-between mb-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Estado Envío</span>
                     <span className="text-[10px] font-black text-brand-primary uppercase">{order.shipment.status.replace('_', ' ')}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Repartidor</span>
                     <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{order.shipment.driver?.name || 'No asignado'}</span>
                   </div>
                   {lastUpdateText && (
                     <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Última ubicación: <span className="text-brand-primary">{lastUpdateText}</span></p>
                     </div>
                   )}
                </div>
                {order.shipment.current_lat && (
                   <div className="flex items-center gap-2 text-emerald-500">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[10px] font-black uppercase tracking-widest">GPS Activo</span>
                   </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">El envío se habilitará al confirmar el pago.</p>
            )}
          </div>

          {/* Historial de Trazabilidad */}
          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-8">
              <Clock className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">Historial del Pedido</h2>
            </div>
            <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100 dark:before:bg-white/5">
              {order.status_history?.map((history: any, idx: number) => (
                <div key={history.id} className="relative pl-10">
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white dark:border-[#0B0F1A] z-10 ${idx === 0 ? 'bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-200 dark:bg-white/10'}`}>
                    {idx === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500" />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest leading-none ${idx === 0 ? 'text-brand-primary' : 'text-slate-500'}`}>
                      {statusLabels[history.status] || history.status}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">
                      {new Date(history.created_at).toLocaleString('es-DO', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).replace(',', '')}
                    </p>
                    {history.comment && (
                      <div className="mt-3 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-white/5 max-w-[90%]">
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 italic font-medium leading-relaxed">
                          "{history.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cambio de Estado */}
      <AnimatePresence>
        {isUpdatingStatus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Actualizar Estado</h3>
                <button onClick={() => setIsUpdatingStatus(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-brand-primary/5 p-6 rounded-[2rem] border border-brand-primary/10 text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cambiar estado a:</p>
                   <p className="text-xl font-black text-brand-primary uppercase tracking-tight">{statusLabels[newStatus]}</p>
                </div>

                {isRejecting ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Motivo de Rechazo (Obligatorio)</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-red-500 mb-4"
                    >
                      <option value="">Selecciona un motivo...</option>
                      <option value="Monto incorrecto">Monto incorrecto</option>
                      <option value="Comprobante ilegible">Comprobante ilegible</option>
                      <option value="Transferencia no encontrada">Transferencia no encontrada</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {rejectionReason === 'Otro' && (
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Especifica el motivo..."
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-bold outline-none dark:text-white min-h-[100px] resize-none focus:ring-2 focus:ring-red-500"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {(newStatus === 'en_camino' || newStatus === 'listo_envio') && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Asignar Repartidor</label>
                    <div className="relative">
                       <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <select
                         value={driverId || ''}
                         onChange={(e) => setDriverId(Number(e.target.value))}
                         className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary appearance-none"
                       >
                         <option value="">Selecciona un repartidor...</option>
                         {drivers?.map((driver: any) => (
                           <option key={driver.id} value={driver.id}>{driver.name} ({driver.phone})</option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Observación / Comentario</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escribe un motivo para el cliente..."
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-bold outline-none dark:text-white min-h-[120px] resize-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/[0.02] flex gap-4">
                <button onClick={() => { setIsUpdatingStatus(false); setIsRejecting(false); }} className="flex-1 py-4 text-sm font-black text-slate-500 uppercase tracking-widest">Cancelar</button>
                <button 
                  onClick={handleUpdateStatus}
                  disabled={updateStatus.isPending || (isRejecting && !rejectionReason)}
                  className={`flex-1 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all ${isRejecting ? 'bg-red-500 shadow-red-500/20' : 'bg-brand-primary shadow-brand-primary/20'}`}
                >
                  {updateStatus.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isRejecting ? 'Confirmar Rechazo' : 'Confirmar Cambio')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrderDetail;
