import React, { useState, useEffect, useMemo } from 'react';
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
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const isOrderCompletedRef = useRef(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPrice = getTotalPrice();
  const addressList = Array.isArray(addresses) ? addresses : (addresses as any)?.data || [];

  const shippingInfo = useMemo(() => {
    const fallback = { cost: 250, isFree: false, zoneName: 'Estándar' };
    const selectedAddress = addressList.find((a: Address) => a.id === selectedAddressId);

    if (!selectedAddress || !settings?.shipping?.zones) return fallback;

    const zones = settings.shipping.zones;
    const match = zones.find((z: any) =>
      selectedAddress.sector?.toLowerCase().includes(z.name.toLowerCase()) ||
      selectedAddress.municipio?.toLowerCase().includes(z.name.toLowerCase()) ||
      selectedAddress.provincia?.toLowerCase().includes(z.name.toLowerCase()) ||
      z.name.toLowerCase().includes(selectedAddress.sector?.toLowerCase() || '') ||
      z.name.toLowerCase().includes(selectedAddress.municipio?.toLowerCase() || '')
    );

    if (!match) return fallback;

    const isFree = totalPrice >= match.freeFrom;
    return {
      cost: isFree ? 0 : match.cost,
      isFree,
      zoneName: match.name
    };
  }, [selectedAddressId, addressList, settings, totalPrice]);

  const shipping = shippingInfo.cost;
  const finalTotal = totalPrice + shipping;

  const isProcessingRef = useRef(false);
  const isOrderCompletedRef = useRef(false);

  useEffect(() => {
    // Redirigir al carrito si está vacío, pero NO si estamos procesando o acabamos de terminar
    // Usamos el ref para que sea instantáneo y no dependa del ciclo de renderizado de React
    if (items.length === 0 && !isOrderCompletedRef.current) {
      navigate('/carrito');
    }
  }, [items.length, navigate]);

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

      // La respuesta del backend contiene { message, order }
      const newOrder = response.data?.order;
      const orderId = newOrder?.id || response.data?.id;

      if (!orderId) {
        console.error('Backend response missing ID:', response.data);
        throw new Error('No se pudo procesar el número de pedido correctamente.');
      }

      setIsOrderCompleted(true);
      isOrderCompletedRef.current = true;

      if (paymentMethod === 'transfer') {
        addNotification('success', '¡Pedido creado con éxito!');
        // Redirigir directamente a la página de pago
        navigate(`/cuenta/pedidos/${orderId}/pagar`);
      } else {
        addNotification('success', '¡Pedido confirmado!');
        navigate('/cuenta/pedidos');
      }

      // Limpiamos el carrito DESPUÉS de iniciar la navegación para evitar el redirect automático del useEffect
      clearCart();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al procesar el pedido.';
      addNotification('error', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsApp = () => {
    addNotification('info', 'Funcionalidad de WhatsApp disponible en el detalle del pedido.');
  };

  if (isLoadingSettings) {
    return (
      <div className="h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-500">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen font-poppins pb-20 pt-32 transition-colors duration-500">
      <SEO title="Finalizar Compra | Garabito Shop" />
      
      <div className="container-custom px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate('/carrito')}
            className="p-3 bg-light-surface dark:bg-white/5 hover:bg-light-border dark:hover:bg-white/10 rounded-2xl transition-all border border-light-border dark:border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-white" />
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-light-text dark:text-white">Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Address Selection */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">1. Dirección de Entrega</h3>
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
                        : 'bg-light-surface dark:bg-white/5 border-light-border dark:border-white/5 hover:border-brand-primary/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${selectedAddressId === addr.id ? 'bg-brand-primary text-white' : 'bg-light-border dark:bg-white/5 text-slate-400 dark:text-gray-500'}`}>
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight text-light-text dark:text-white">{addr.alias || addr.sector}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1 uppercase font-bold">{addr.alias ? addr.sector + ', ' : ''}{addr.provincia}, {addr.municipio}</p>
                          </div>
                        </div>
                        {selectedAddressId === addr.id && <CheckCircle2 className="w-6 h-6 text-brand-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-10 bg-light-surface dark:bg-white/5 border border-dashed border-light-border dark:border-white/10 rounded-[2.5rem] text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-6">No tienes direcciones guardadas</p>
                  <Link to="/cuenta/direcciones" className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest inline-block">Configurar Dirección</Link>
                </div>
              )}
            </section>

            {/* 2. Payment Method Selection */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">2. Método de Pago</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`flex items-center gap-4 p-6 rounded-[2.5rem] border transition-all ${
                    paymentMethod === 'transfer' 
                    ? 'bg-brand-primary/10 border-brand-primary shadow-xl shadow-brand-primary/5' 
                    : 'bg-light-surface dark:bg-white/5 border-light-border dark:border-white/5 hover:border-brand-primary/20'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${paymentMethod === 'transfer' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-light-border dark:bg-white/5 text-slate-400 dark:text-gray-500'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-tight text-light-text dark:text-white">Transferencia</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black mt-0.5">Depósito / APP</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center gap-4 p-6 rounded-[2.5rem] border transition-all ${
                    paymentMethod === 'cod' 
                    ? 'bg-brand-primary/10 border-brand-primary shadow-xl shadow-brand-primary/5' 
                    : 'bg-light-surface dark:bg-white/5 border-light-border dark:border-white/5 hover:border-brand-primary/20'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${paymentMethod === 'cod' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-light-border dark:bg-white/5 text-slate-400 dark:text-gray-500'}`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-tight text-light-text dark:text-white">Efectivo</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black mt-0.5">Contra entrega</p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-light-surface dark:bg-[#0B0F1A] border border-light-border dark:border-white/5 p-8 rounded-[3rem] sticky top-32 space-y-8 shadow-glass-light dark:shadow-2xl overflow-hidden group transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
              
              <h3 className="text-2xl font-black tracking-tight uppercase text-light-text dark:text-white">Resumen</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-light-text dark:text-white">RD$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  <span>Logística ({shippingInfo.zoneName})</span>
                  <span className={shippingInfo.isFree ? 'text-emerald-500' : 'text-light-text dark:text-white'}>
                    {shippingInfo.isFree ? 'GRATIS' : `RD$ ${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="pt-8 border-t border-light-border dark:border-white/5 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Final</span>
                    <span className="text-slate-300 dark:text-gray-600 text-[8px] font-black uppercase tracking-tighter">Impuestos incluidos</span>
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
                
                <p className="text-[9px] text-slate-400 dark:text-gray-500 text-center font-black uppercase tracking-widest">
                  {paymentMethod === 'transfer' ? 'Verás instrucciones al confirmar' : 'Pagarás al recibir tus productos'}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Seguro
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-light-border dark:bg-white/5" />
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
