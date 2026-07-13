import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  Info,
  Copy,
  Check,
  MessageCircle,
  X,
  Wallet,
  ShoppingCart,
  Zap,
  Building2,
  User,
  ExternalLink
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserAddresses } from '../hooks/useUserAccount';
import { useSettings } from '../hooks/useSettings';
import OrderService from '../api/OrderService';
import SEO from '../components/common/SEO';
import { WhatsAppService } from '../services/WhatsAppService';
import type { Address, Order } from '../types';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: addresses, isLoading: isLoadingAddresses } = useUserAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cod'>('transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 5000 ? 0 : 250;
  const finalTotal = totalPrice + shipping;

  const addressList = Array.isArray(addresses) ? addresses : (addresses as any)?.data || [];

  useEffect(() => {
    if (items.length === 0 && !showInstructions) {
      navigate('/carrito');
    }
  }, [items, navigate, showInstructions]);

  useEffect(() => {
    if (addressList.length > 0 && selectedAddressId === null) {
      const defaultAddr = addressList.find((a: Address) => a.is_default) || addressList[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addressList, selectedAddressId]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addNotification('success', 'Copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addNotification('error', 'Por favor, selecciona una dirección de envío.');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        shipping_address_id: selectedAddressId,
        payment_method: paymentMethod,
        status: paymentMethod === 'transfer' ? 'in_review' : 'on_delivery',
        total: finalTotal,
      };

      const response = await OrderService.create(orderData);
      const order = response.data?.order || response.data;
      
      clearCart();

      if (paymentMethod === 'transfer') {
        addNotification('success', '¡Pedido creado! Procede a realizar el pago.');
        navigate(`/cuenta/pedidos/${order.id}/pagar`);
      } else {
        addNotification('success', '¡Pedido realizado con éxito!');
        navigate('/cuenta/pedidos');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al procesar el pedido.';
      addNotification('error', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsApp = () => {
    if (!createdOrder) return;
    const url = WhatsAppService.getOrderConfirmationUrl(
      createdOrder.order_number,
      createdOrder.total,
      user?.name || '',
      settings?.general?.supportPhone
    );
    window.open(url, '_blank');
  };

  // Payment Instructions Modal (Post-Order Transfer)
  const InstructionsModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0B0F1A] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Instrucciones de Pago</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Pedido #{createdOrder?.order_number}</p>
            </div>
          </div>
          <button onClick={() => navigate('/cuenta/pedidos')} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Purchase Summary Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShoppingCart className="w-24 h-24 text-white -rotate-12" />
             </div>
             <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 relative z-10">Resumen de Compra</h3>
             <div className="space-y-4 relative z-10">
                {createdOrder?.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm font-bold uppercase tracking-tight">
                    <span className="text-gray-300">{item.product?.name || 'Producto'} <span className="text-brand-primary ml-1">x{item.quantity}</span></span>
                    <span className="text-white">RD$ {Number(item.subtotal || 0).toLocaleString()}</span>
                  </div>
                ))}
             </div>
             <div className="pt-6 border-t border-white/10 flex justify-between items-end relative z-10">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total a Transferir</span>
                <span className="text-4xl font-black text-brand-primary tracking-tighter">RD$ {Number(createdOrder?.total || 0).toLocaleString()}</span>
             </div>
          </div>

          {/* Bank Accounts Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500 ml-2">
               <Info className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Cuentas Bancarias para Transferencia</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings?.general?.bankAccounts && settings.general.bankAccounts.length > 0 ? (
                settings.general.bankAccounts.map((bank: any) => (
                  <div key={bank.id} className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.07] transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{bank.bankName}</span>
                      <button 
                        onClick={() => handleCopy(bank.accountNumber, bank.id)}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-lg"
                      >
                        <span className="text-[8px] font-black uppercase">{copiedId === bank.id ? 'Copiado' : 'Copiar'}</span>
                        {copiedId === bank.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-2xl font-black text-white tracking-widest mb-3 font-mono relative z-10">{bank.accountNumber}</p>
                    <div className="flex items-center justify-between relative z-10">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                        {bank.accountType} <span className="mx-1">•</span> {bank.ownerName}
                      </p>
                    </div>
                    {/* Ghost background icon */}
                    <Building2 className="absolute -bottom-4 -right-4 w-16 h-16 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ))
              ) : (
                <div className="col-span-full p-10 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">Cuentas no configuradas. Por favor contacta soporte.</p>
                </div>
              )}
            </div>
          </div>

          {/* Warning/Info Box */}
          <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] flex items-start gap-4">
             <div className="bg-brand-primary/20 p-2.5 rounded-xl mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
             </div>
             <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                Una vez realizada la transferencia, envía el comprobante por WhatsApp o por el chat de asistencia para validar tu pago y proceder con el envío.
             </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 flex items-center justify-between gap-4 bg-white/[0.01]">
          <button 
            onClick={() => navigate('/cuenta/pedidos')}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors px-4 py-2"
          >
            Cerrar
          </button>
          <button 
            onClick={handleWhatsApp}
            className="bg-[#25D366] text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-green-500/30"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            WhatsApp
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoadingSettings) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#020617] text-white min-h-screen font-poppins pb-20 pt-32">
      <SEO title="Finalizar Compra | Garabito Shop" />
      
      <AnimatePresence>
        {showInstructions && <InstructionsModal />}
      </AnimatePresence>

      <div className="container-custom px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate('/carrito')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Address Selection */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">1. Dirección de Entrega</h3>
                <Link to="/cuenta/direcciones" className="text-[10px] font-black text-brand-primary uppercase hover:underline">Gestionar</Link>
              </div>
              
              {!isLoadingAddresses && addressList.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {addressList.map((addr: Address) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                        selectedAddressId === addr.id 
                        ? 'bg-brand-primary/10 border-brand-primary' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${selectedAddressId === addr.id ? 'bg-brand-primary text-white' : 'bg-white/5 text-gray-500'}`}>
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight">{addr.sector}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{addr.provincia}, {addr.municipio}</p>
                          </div>
                        </div>
                        {selectedAddressId === addr.id && <CheckCircle2 className="w-6 h-6 text-brand-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-10 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-xs font-bold text-gray-500 uppercase mb-6">No tienes direcciones guardadas</p>
                  <Link to="/cuenta/direcciones" className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest inline-block">Configurar Dirección</Link>
                </div>
              )}
            </section>

            {/* 2. Payment Method Selection */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">2. Método de Pago</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`flex items-center gap-4 p-6 rounded-[2.5rem] border transition-all ${
                    paymentMethod === 'transfer' 
                    ? 'bg-brand-primary/10 border-brand-primary shadow-xl shadow-brand-primary/5' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${paymentMethod === 'transfer' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white/5 text-gray-500'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-tight">Transferencia</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Depósito / APP</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center gap-4 p-6 rounded-[2.5rem] border transition-all ${
                    paymentMethod === 'cod' 
                    ? 'bg-brand-primary/10 border-brand-primary shadow-xl shadow-brand-primary/5' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${paymentMethod === 'cod' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white/5 text-gray-500'}`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-tight">Efectivo</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Contra entrega</p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-[#0B0F1A] border border-white/5 p-8 rounded-[3rem] sticky top-32 space-y-8 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
              
              <h3 className="text-2xl font-black tracking-tight uppercase">Resumen</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white">RD$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <span>Envío</span>
                  <span className={shipping === 0 ? 'text-emerald-500' : 'text-white'}>
                    {shipping === 0 ? 'GRATIS' : `RD$ ${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Final</span>
                    <span className="text-gray-600 text-[8px] font-black uppercase tracking-tighter">Impuestos incluidos</span>
                  </div>
                  <span className="text-5xl font-black text-brand-primary tracking-tighter">RD$ {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedAddressId}
                  className="w-full py-7 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                  {paymentMethod === 'transfer' ? 'Pagar ahora' : 'Confirmar Pedido'}
                </button>
                
                <p className="text-[9px] text-gray-500 text-center font-black uppercase tracking-widest">
                  {paymentMethod === 'transfer' ? 'Verás instrucciones al confirmar' : 'Pagarás al recibir tus productos'}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Seguro
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Garantía
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
