import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  Copy,
  Check,
  Upload,
  ShoppingBag,
  Info,
  FileText
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useOrderDetail, useUploadPaymentProof } from '../../hooks/useOrders';
import { useSettings } from '../../hooks/useSettings';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getAssetUrl } from '../../utils/asset';

const UserPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addNotification = useNotificationStore(state => state.addNotification);
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const { data: order, isLoading: isLoadingOrder, error } = useOrderDetail(id);
  const uploadProof = useUploadPaymentProof();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (order && !['pendiente_pago', 'pending', 'awaiting_payment'].includes(order.status)) {
      addNotification('info', 'Este pedido ya no está en espera de pago.');
      navigate(`/cuenta/pedidos/${id}`);
    }
  }, [order, id, navigate, addNotification]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('pdf');
      }
    }
  };

  const handleCopy = (text: string, bankId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(bankId);
    addNotification('success', 'Copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };


  if (isLoadingOrder || isLoadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary mb-4" />
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Configurando Pago Seguro...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 min-h-[60vh] bg-black flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Pedido no encontrado</h2>
        <Link to="/cuenta/pedidos" className="mt-8 px-10 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest">Volver a mis pedidos</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-poppins selection:bg-brand-primary/30 relative overflow-hidden pb-20">
      <SEO title={`Pagar Pedido #${order.order_number} | Garabito Shop`} />

      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="noise-bg absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              Pago 100% Seguro
            </motion.div>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
              Completa <br />
              <span className="text-gradient">Tu Pago.</span>
            </h1>
          </div>
          <Link to={`/cuenta/pedidos/${order.id}`} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <ChevronLeft className="w-4 h-4" />
            Detalles del Pedido
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Instrucciones y Cuentas */}
          <div className="lg:col-span-7 space-y-12">

            {/* Banner de Monto */}
            <div className="glass rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-blue-400 to-brand-primary" />
               <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Referencia del Pedido</p>
                  <p className="text-2xl font-black font-mono tracking-tighter">#{order.order_number}</p>
               </div>
               <div className="h-12 w-px bg-white/10 hidden md:block" />
               <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Monto a Transferir</p>
                  <p className="text-5xl font-black text-white tracking-tighter">RD$ {Number(order.total).toLocaleString()}</p>
               </div>
            </div>

            {/* Cuentas Bancarias */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
                <Building2 className="w-4 h-4 text-brand-primary" />
                Cuentas Bancarias para Transferencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings?.general.bankAccounts.map((bank: any) => (
                  <div key={bank.id} className="glass rounded-[2rem] p-8 hover:bg-white/[0.08] transition-all group relative overflow-hidden border-white/5">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        {bank.bankLogo && (
                          <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-2xl">
                            <img src={getAssetUrl(bank.bankLogo)} alt={bank.bankName} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{bank.bankName}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(bank.accountNumber, bank.id)}
                        className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-brand-primary transition-all shadow-inner"
                      >
                        {copiedId === bank.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-2xl font-black text-white tracking-[0.1em] font-mono mb-4 relative z-10">{bank.accountNumber}</p>
                    <div className="flex items-center justify-between relative z-10">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                        {bank.accountType} <span className="mx-1">•</span> {bank.ownerName}
                      </p>
                    </div>
                    <Building2 className="absolute -bottom-6 -right-6 w-24 h-24 text-white/[0.02] -rotate-12 group-hover:scale-110 group-hover:text-brand-primary/[0.05] transition-all duration-700" />
                  </div>
                ))}
              </div>
            </section>

            {/* Envío de Comprobante */}
            <section className="glass rounded-[3rem] p-10 sm:p-12 space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-brand-primary" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Adjuntar Comprobante de Pago</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">El archivo debe pesar menos de 10MB (JPG, PNG, WEBP, PDF)</p>
                 </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const file = (formData.get('proof') as File);
                  if (!file || file.size === 0) return addNotification('error', 'El comprobante es obligatorio');

                  try {
                    await uploadProof.mutateAsync({
                      id: order.id,
                      file,
                      amount_paid: order.total,
                      issuing_bank: formData.get('issuing_bank') as string,
                      confirm_owner: formData.get('confirm_owner') === 'on'
                    });
                    navigate(`/cuenta/pedidos/${order.id}`);
                  } catch (err) {}
                }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Banco Emisor</label>
                    <select name="issuing_bank" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-all appearance-none">
                      <option value="">Selecciona tu banco...</option>
                      {settings?.general?.bankAccounts?.map((bank: any) => (
                        <option key={bank.id} value={bank.bankName}>{bank.bankName}</option>
                      ))}
                      <option value="Otro">Otro Banco...</option>
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Monto a Confirmar</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white/50">
                      RD$ {Number(order.total).toLocaleString()}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Suelta tu comprobante aquí</label>
                    <div className="relative group/file h-48">
                       <input
                         name="proof"
                         type="file"
                         required
                         accept="image/*,.pdf"
                         onChange={handleFileChange}
                         className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                       />
                       <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center transition-all group-hover/file:bg-white/10">
                          {filePreview ? (
                            filePreview === 'pdf' ? (
                              <div className="flex flex-col items-center">
                                <FileText className="w-12 h-12 text-brand-primary mb-2" />
                                <span className="text-[10px] font-black uppercase text-white">Archivo PDF seleccionado</span>
                              </div>
                            ) : (
                              <div className="w-full h-full p-2">
                                <img src={filePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                              </div>
                            )
                          ) : (
                            <div className="flex flex-col items-center opacity-40 group-hover/file:opacity-100 transition-opacity">
                              <Upload className="w-8 h-8 mb-2 text-brand-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Elige un archivo o arrástralo aquí</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                  <input type="checkbox" name="confirm_owner" required id="confirm_owner" className="w-6 h-6 rounded-lg border-white/10 bg-black text-brand-primary focus:ring-offset-0 focus:ring-brand-primary cursor-pointer" />
                  <label htmlFor="confirm_owner" className="text-[10px] text-gray-400 font-bold uppercase tracking-tight cursor-pointer select-none">
                    Confirmo que realicé esta transferencia desde mi propia cuenta.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadProof.isPending}
                  className="shimmer-btn w-full py-7 bg-brand-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-blue hover:scale-[1.01] active:scale-0.98 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {uploadProof.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Enviar Comprobante</>}
                </button>
              </form>
            </section>
          </div>

          {/* Sidebar de Resumen */}
          <div className="lg:col-span-5 space-y-8">
            <aside className="glass rounded-[3rem] p-10 sticky top-32 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                 <ShoppingBag className="w-40 h-44 text-white" />
              </div>

              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                Artículos del Pedido
              </h3>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-5 group/item">
                    <div className="w-16 h-20 rounded-2xl bg-[#0B0F1A] overflow-hidden shrink-0 border border-white/5 shadow-inner">
                      <img src={getAssetUrl(item.product?.images?.[0] || item.product?.image_url)} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[11px] font-black text-white uppercase truncate tracking-tight">{item.product?.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">
                        {item.quantity} unidades <span className="mx-2 text-white/10">|</span> RD$ {Number(item.unit_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4 relative z-10">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-white">RD$ {Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Envío</span>
                  <span className="text-emerald-500 font-black">RD$ {Number(order.shipping_cost).toLocaleString()}</span>
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Precio Total</span>
                    <p className="text-[8px] text-brand-primary font-black uppercase mt-1">Impuestos Incluidos</p>
                  </div>
                  <span className="text-4xl font-black text-white tracking-tighter">RD$ {Number(order.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] flex items-start gap-4 relative z-10">
                 <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                    Nuestro equipo verificará tu transferencia en un plazo de 1 a 24 horas laborables.
                 </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPayment;
