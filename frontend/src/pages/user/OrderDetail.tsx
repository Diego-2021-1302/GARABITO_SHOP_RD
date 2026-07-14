import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  Download,
  AlertCircle,
  Loader2,
  XCircle,
  FileText,
  Upload,
  Building2,
  Copy,
  Check,
  MessageCircle,
  Phone
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useOrderDetail, useCancelOrder, useUploadPaymentProof, useMarkAsDelivered } from '../../hooks/useOrders';
import { useSettings } from '../../hooks/useSettings';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getAssetUrl } from '../../utils/asset';

import TrackingMap from '../../components/common/TrackingMap';

const statusLabels: Record<string, string> = {
  'pendiente_pago': 'Pendiente de Pago',
  'comprobante_subido': 'Comprobante Subido',
  'pago_confirmado': 'Pago Confirmado',
  'preparando': 'Preparando Pedido',
  'listo_envio': 'Listo para Envío',
  'en_camino': 'En Camino',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado',
};

const UserOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const addNotification = useNotificationStore(state => state.addNotification);
  const { data: settings } = useSettings();
  
  const { data: order, isLoading, error } = useOrderDetail(id);
  const cancelOrder = useCancelOrder();
  const uploadProof = useUploadPaymentProof();
  const markAsDelivered = useMarkAsDelivered();

  const [lastUpdateText, setLastUpdateText] = useState<string>('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efecto para calcular el tiempo transcurrido desde la última actualización de ubicación
  useEffect(() => {
    if (!order?.shipment?.last_location_update) return;

    const updateText = () => {
      const lastUpdate = new Date(order.shipment.last_location_update);
      const diff = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);

      if (diff < 60) setLastUpdateText(`hace ${diff} segundos`);
      else if (diff < 3600) setLastUpdateText(`hace ${Math.floor(diff / 60)} minutos`);
      else setLastUpdateText('hace más de una hora');
    };

    updateText();
    const interval = setInterval(updateText, 10000); // Actualizar texto cada 10s
    return () => clearInterval(interval);
  }, [order?.shipment?.last_location_update]);


  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      await uploadProof.mutateAsync({ id, file });
      addNotification('success', 'Comprobante enviado correctamente. Validaremos tu pago a la brevedad.');
    } catch (err) {
      addNotification('error', 'Error al subir el archivo.');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelOrder.mutateAsync(id);
      addNotification('success', 'Pedido cancelado exitosamente');
      setIsCancelModalOpen(false);
    } catch (err) {
      addNotification('error', 'No se pudo cancelar el pedido');
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!id) return;
    try {
      await markAsDelivered.mutateAsync(id);
      addNotification('success', '¡Gracias por confirmar! Tu pedido ha sido finalizado con éxito.');
    } catch (err) {
      addNotification('error', 'Error al confirmar la entrega.');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Cargando detalles del pedido...</p>
    </div>
  );

  if (error || !order) return (
    <div className="text-center py-20">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
      <Link to="/cuenta/pedidos" className="btn-primary px-8 py-3 rounded-xl inline-block">Volver a mis pedidos</Link>
    </div>
  );

  const isPendingPayment = order.status === 'pendiente_pago';
  const isProofSubmitted = order.status === 'comprobante_subido';
  const canCancel = ['pendiente_pago', 'comprobante_subido', 'preparando'].includes(order.status);
  const hasInvoice = !!order.invoice_pdf_path;

  return (
    <div className="space-y-8 pb-20">
      <SEO title={`Pedido ${order.order_number} | Garabito Shop`} />
      
      <div className="flex items-center justify-between">
        <Link to="/cuenta/pedidos" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>
        <div className="flex gap-4">
          {canCancel && (
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              <XCircle className="w-4 h-4" />
              Cancelar Pedido
            </button>
          )}
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#0B0F1A] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-3xl font-poppins font-black text-slate-800 dark:text-white uppercase tracking-tighter">Orden #{order.order_number}</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Realizado el {new Date(order.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="font-black text-brand-primary uppercase text-xs tracking-widest">{statusLabels[order.status] || order.status}</span>
          </div>
          {hasInvoice && (
            <a 
              href={getAssetUrl(order.invoice_pdf_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN DE PAGO (Solo si está pendiente o subido) */}
          {(isPendingPayment || isProofSubmitted) && (
            <section className="bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {isPendingPayment ? 'Completa tu pago' : 'Comprobante recibido'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {isPendingPayment
                      ? 'Realiza la transferencia para procesar tu pedido'
                      : 'Hemos recibido tus datos, el administrador comenzará la revisión pronto.'}
                  </p>
                </div>
              </div>

              {isPendingPayment && (
                <div className="bg-white dark:bg-brand-dark/40 border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto a pagar</p>
                      <p className="text-3xl font-poppins font-black text-brand-primary">RD$ {Number(order.total).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 md:text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Referencia del pedido</p>
                      <p className="text-xl font-poppins font-black text-brand-secondary dark:text-white">#{order.order_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings?.general.bankAccounts.map((bank: any) => (
                      <div key={bank.id} className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-transparent hover:border-brand-primary/30 transition-all relative group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            {bank.bankLogo && (
                              <img src={getAssetUrl(bank.bankLogo)} alt={bank.bankName} className="w-5 h-5 object-contain" />
                            )}
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{bank.bankName}</span>
                          </div>
                          <button onClick={() => handleCopy(bank.accountNumber, bank.id)} className="text-slate-400 hover:text-brand-primary transition-colors">
                            {copiedId === bank.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-white font-mono tracking-wider">{bank.accountNumber}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{bank.accountType} • {bank.ownerName}</p>
                        <Building2 className="absolute -bottom-2 -right-2 w-12 h-12 text-slate-500/5 -rotate-12 group-hover:scale-110 transition-transform" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      to={`/cuenta/pedidos/${order.id}/pagar`}
                      className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand-primary/30"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pagar Pedido Ahora
                    </Link>
                  </div>
                </div>
              )}

              {!isPendingPayment && (
                <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-8 items-center">
                   <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Datos registrados correctamente</p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                         <div className="text-[10px] font-bold uppercase text-slate-400">Banco: <span className="text-slate-600 dark:text-gray-300">{order.issuing_bank}</span></div>
                         <div className="text-[10px] font-bold uppercase text-slate-400">Monto: <span className="text-brand-primary">RD$ {Number(order.amount_paid).toLocaleString()}</span></div>
                      </div>
                   </div>
                   {order.payment_proof && (
                     <a href={getAssetUrl(order.payment_proof)} target="_blank" className="text-[10px] font-black text-brand-primary uppercase underline tracking-widest">Ver Archivo</a>
                   )}
                </div>
              )}
            </section>
          )}

          {/* MAPA DE SEGUIMIENTO (Solo si está en camino) */}
          {order.status === 'en_camino' && (
            <section className="bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden h-[400px] relative">
               <TrackingMap
                 destination={{
                   lat: Number(order.shipping_address?.latitude || 18.4861),
                   lng: Number(order.shipping_address?.longitude || -69.9312)
                 }}
                 driverLocation={order.shipment?.current_lat ? {
                   lat: Number(order.shipment.current_lat),
                   lng: Number(order.shipment.current_lng)
                 } : undefined}
               />

               {/* Overlay Info */}
               <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
                  <div className="bg-white/95 dark:bg-[#0B0F1A]/95 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                        <Truck className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">En Camino</p>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Tu repartidor está en ruta</h4>
                        {lastUpdateText && (
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ubicación actualizada {lastUpdateText}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.shipment?.driver?.phone && (
                        <a
                          href={`tel:${order.shipment.driver.phone}`}
                          className="pointer-events-auto p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-white hover:bg-brand-primary hover:text-white transition-all"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                      )}
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${order.shipment.current_lat},${order.shipment.current_lng}`, '_blank')}
                        className="pointer-events-auto px-6 py-4 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                      >
                        Ubicación Real
                      </button>
                    </div>
                  </div>
               </div>

               {/* Botón Flotante para Confirmar Entrega */}
               <div className="absolute top-6 right-6 z-20 pointer-events-none">
                  <button
                    onClick={handleMarkAsDelivered}
                    disabled={markAsDelivered.isPending}
                    className="pointer-events-auto px-8 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {markAsDelivered.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Marcar como Entregado
                  </button>
               </div>
            </section>
          )}

          <section className="bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Resumen de productos</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.items?.length} artículos</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-8 flex items-center gap-6 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white/5 overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-inner">
                    <img
                      src={getAssetUrl(item.product?.images?.[0] || item.product?.image_url)}
                      alt={item.product?.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight mb-1">{item.product?.name}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 dark:text-white text-lg tracking-tighter">RD$ {Number(item.subtotal).toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">RD$ {Number(item.unit_price).toLocaleString()} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-[#0B0F1A] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-primary" />
                Entrega en
              </h4>
              <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-gray-300">
                {order.shipping_address?.address}, {order.shipping_address?.city}
              </p>
              <p className="text-[10px] text-brand-primary font-black mt-2 uppercase tracking-widest">{order.shipping_address?.phone}</p>
            </div>
            <div className="pt-8 border-t border-slate-100 dark:border-white/5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-primary" />
                Pago
              </h4>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{order.payment_method === 'transfer' ? 'Transferencia Bancaria' : 'Efectivo contra entrega'}</p>
              <div className="mt-3">
                <span className={`text-[10px] px-4 py-2 rounded-xl font-black tracking-widest uppercase ${order.payment_status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {order.payment_status === 'completed' ? 'PAGADO' : 'PENDIENTE DE PAGO'}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 dark:bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-2xl shadow-brand-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <FileText className="w-24 h-24" />
            </div>
            <h3 className="text-xs font-black mb-8 uppercase tracking-[0.3em] relative z-10 opacity-60">Resumen Final</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-80">
                <span>Subtotal</span>
                <span>RD$ {Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span>Envío</span>
                <span className={order.shipping_cost > 0 ? 'text-white' : 'text-emerald-400'}>
                  {order.shipping_cost > 0 ? `RD$ ${Number(order.shipping_cost).toLocaleString()}` : 'GRATIS'}
                </span>
              </div>
              <div className="pt-8 mt-8 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-[0.4em]">Total</span>
                <span className="text-3xl font-black tracking-tighter">RD$ {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* TRAZABILIDAD COMPLETA */}
          <section className="bg-white dark:bg-[#0B0F1A] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Historial del Pedido</h3>
            <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100 dark:before:bg-white/5">
              {order.status_history?.map((history: any, idx: number) => (
                <div key={history.id} className="relative pl-10">
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white dark:border-[#0B0F1A] z-10 ${idx === 0 ? 'bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-200 dark:bg-white/10'}`}>
                    {idx === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500" />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest leading-none ${idx === 0 ? 'text-brand-primary' : 'text-slate-500'}`}>{statusLabels[history.status] || history.status}</p>
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
          </section>
        </div>
      </div>

      {/* Modal Cancelar */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B0F1A] rounded-[3rem] shadow-3xl w-full max-w-md p-10 border border-slate-200 dark:border-white/10 text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">¿Cancelar pedido?</h3>
              <p className="text-slate-500 text-xs font-bold mb-10 leading-relaxed uppercase tracking-widest">Se liberará el inventario reservado inmediatamente. Esta acción es irreversible.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Cerrar</button>
                <button 
                  onClick={handleCancel}
                  disabled={cancelOrder.isPending}
                  className="flex-1 py-4 text-xs font-black text-white bg-red-500 rounded-2xl shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserOrderDetail;
