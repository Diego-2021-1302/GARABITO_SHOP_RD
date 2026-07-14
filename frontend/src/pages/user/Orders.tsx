import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  Loader2, 
  FileText,
  CreditCard,
  X,
  Copy,
  Wallet,
  CheckCircle2,
  Info,
  Building2,
  Check,
  Upload
} from 'lucide-react';
import { useOrders, useUploadPaymentProof } from '../../hooks/useOrders';
import { useSettings } from '../../hooks/useSettings';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { WhatsAppService } from '../../services/WhatsAppService';
import SEO from '../../components/common/SEO';
import { getAssetUrl } from '../../utils/asset';

const statusStyles: Record<string, string> = {
  'pendiente_pago': 'bg-amber-50 text-amber-600 border-amber-100',
  'pending': 'bg-amber-50 text-amber-600 border-amber-100',
  'awaiting_payment': 'bg-amber-50 text-amber-600 border-amber-100',
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
  'pending': 'Pendiente de Pago',
  'awaiting_payment': 'Pendiente de Pago',
  'comprobante_subido': 'Comprobante Subido',
  'pago_confirmado': 'Pago Confirmado',
  'preparando': 'Preparando',
  'listo_envio': 'Listo para Envío',
  'en_camino': 'En Camino',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado',
};

const UserOrders: React.FC = () => {
  const navigate = useNavigate();
  const { data: ordersResponse, isLoading } = useOrders();
  const { data: settings } = useSettings();
  const { user } = useAuthStore();
  const addNotification = useNotificationStore(state => state.addNotification);
  const uploadProof = useUploadPaymentProof();
  const orders = ordersResponse?.data || [];

  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);


  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addNotification('success', 'Copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsApp = () => {
    if (!selectedOrderForPayment) return;
    const url = WhatsAppService.getOrderConfirmationUrl(
      selectedOrderForPayment.order_number,
      selectedOrderForPayment.total,
      user?.name || '',
      settings?.general?.supportPhone
    );
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
        <p className="text-slate-500 animate-pulse font-bold">Sincronizando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEO title="Mis Pedidos | Garabito Shop" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold dark:text-white">Mis Pedidos</h1>
          <p className="text-slate-500 dark:text-gray-400">Sigue el progreso de tus compras desde la revisión hasta la entrega</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-white/10" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No tienes pedidos activos</h3>
          <p className="text-slate-500 dark:text-gray-400 mb-6">Tus compras aparecerán aquí una vez que confirmes el carrito.</p>
          <button onClick={() => navigate('/catalogo')} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Explorar Tienda</button>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any, idx: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-[#0B0F1A] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden"
            >
              <div className="p-5 md:p-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6 md:gap-10">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">No. Pedido</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">#{order.order_number}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado Actual</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border shadow-sm ${statusStyles[order.status] || 'bg-slate-100'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</span>
                    <span className="font-bold text-sm text-brand-primary">RD$ {Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/cuenta/pedidos/${order.id}`)}
                  className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline group"
                >
                  Ver Detalles y Seguimiento
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex -space-x-3 overflow-hidden">
                  {order.items?.slice(0, 5).map((item: any, i: number) => (
                    <div key={i} className="w-12 h-12 rounded-lg border-2 border-white dark:border-[#0B0F1A] bg-slate-100 overflow-hidden shadow-sm">
                      <img src={getAssetUrl(item.product?.images?.[0]?.image_url || item.product?.image_url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items?.length > 5 && (
                    <div className="w-12 h-12 rounded-lg border-2 border-white dark:border-[#0B0F1A] bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      +{order.items.length - 5}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {(['pendiente_pago', 'pending', 'awaiting_payment'].includes(order.status)) && (
                      <button 
                        onClick={() => navigate(`/cuenta/pedidos/${order.id}/pagar`)}
                        className="flex items-center gap-2 bg-brand-primary text-white py-2.5 px-6 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                      >
                        <CreditCard className="w-4 h-4" /> Pagar Pedido
                      </button>
                    )}
                    {order.ncf_record && (
                      <button className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 py-2.5 px-6 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                        <FileText className="w-4 h-4" /> Factura NCF
                      </button>
                    )}
                </div>
              </div>

              {(['pendiente_pago', 'pending', 'awaiting_payment'].includes(order.status)) && (
                <div className="px-6 pb-6 flex items-center gap-2 text-[11px] text-amber-600 font-medium italic">
                  <Clock className="w-3.5 h-3.5" />
                  Tu pedido está en espera de pago. Por favor, realiza la transferencia bancaria para procesar tu envío.
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Pago */}
      <AnimatePresence>
        {selectedOrderForPayment && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Instrucciones de Pago</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pedido #{selectedOrderForPayment.order_number}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                {/* Resumen */}
                <div className="bg-slate-50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto a pagar</p>
                      <p className="text-3xl font-poppins font-black text-brand-primary">RD$ {Number(selectedOrderForPayment.total).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 md:text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Referencia del pedido</p>
                      <p className="text-xl font-poppins font-black text-brand-secondary dark:text-white">#{selectedOrderForPayment.order_number}</p>
                    </div>
                  </div>
                </div>

                {/* Cuentas */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-brand-primary" />
                    Cuentas Bancarias para Transferencia
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settings?.general?.bankAccounts && settings.general.bankAccounts.length > 0 ? (
                      settings.general.bankAccounts.map((bank: any) => (
                        <div key={bank.id} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 group hover:border-brand-primary/30 transition-all shadow-sm relative overflow-hidden">
                          <div className="flex justify-between items-center mb-1 relative z-10">
                            <div className="flex items-center gap-2">
                              {bank.bankLogo && (
                                <img src={getAssetUrl(bank.bankLogo)} alt={bank.bankName} className="w-5 h-5 object-contain" />
                              )}
                              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{bank.bankName}</span>
                            </div>
                            <button 
                              onClick={() => handleCopy(bank.accountNumber, bank.id)} 
                              className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[10px] font-bold"
                            >
                              {copiedId === bank.id ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                            </button>
                          </div>
                          <p className="text-base font-black text-slate-800 dark:text-white tracking-wider relative z-10">{bank.accountNumber}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase relative z-10">
                            {bank.accountType} <span className="mx-1">•</span> {bank.ownerName}
                          </p>
                          <Building2 className="absolute -bottom-2 -right-2 w-12 h-12 text-slate-100 dark:text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full p-10 bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Cuentas no configuradas.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulario de Comprobante */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const file = (formData.get('proof') as File);
                    if (!file || file.size === 0) return addNotification('error', 'El comprobante es obligatorio');
                    if (file.size > 10 * 1024 * 1024) return addNotification('error', 'El archivo supera los 10MB');

                    try {
                      await uploadProof.mutateAsync({
                        id: selectedOrderForPayment.id,
                        file,
                        amount_paid: selectedOrderForPayment.total,
                        issuing_bank: formData.get('issuing_bank') as string,
                        transaction_reference: formData.get('transaction_reference') as string,
                        confirm_owner: formData.get('confirm_owner') === 'on'
                      });
                      setSelectedOrderForPayment(null);
                    } catch (err) {}
                  }}
                  className="space-y-6 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Banco Emisor</label>
                      <select name="issuing_bank" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary">
                        <option value="">Selecciona tu banco...</option>
                        {settings?.general?.bankAccounts?.map((bank: any) => (
                          <option key={bank.id} value={bank.bankName}>{bank.bankName}</option>
                        ))}
                        <option value="Otro">Otro banco...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Referencia / No. Autorización</label>
                      <input name="transaction_reference" type="text" required placeholder="000000" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Adjuntar Comprobante (JPG, PNG, WEBP, PDF - Máx 10MB)</label>
                      <input name="proof" type="file" required accept="image/*,.pdf" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none dark:text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand-primary file:text-white cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                    <input type="checkbox" name="confirm_owner" required id="confirm_owner" className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                    <label htmlFor="confirm_owner" className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-tight cursor-pointer">☑ Confirmo que realicé esta transferencia.</label>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={uploadProof.isPending}
                      className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-brand-primary/30"
                    >
                      {uploadProof.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      Enviar Comprobante
                    </button>
                  </div>
                </form>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex gap-4">
                <button 
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                  Volver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserOrders;
