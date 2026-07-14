import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingCart,
  ShieldCheck, 
  Truck,
  Zap,
  Lock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronDown,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserAddresses } from '../hooks/useUserAccount';
import { useSettings } from '../hooks/useSettings';
import SEO from '../components/common/SEO';
import { WhatsAppService } from '../services/WhatsAppService';
import { getAssetUrl } from '../utils/asset';
import type { Address } from '../types';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const { user } = useAuthStore();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const { data: addresses, isLoading: isLoadingAddresses } = useUserAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shipping = totalPrice > 5000 ? 0 : 250;
  const finalTotal = totalPrice + shipping;

  const addressList = Array.isArray(addresses) ? addresses : (addresses as any)?.data || [];

  React.useEffect(() => {
    if (addressList.length > 0 && selectedAddressId === null) {
      const defaultAddr = addressList.find((a: Address) => a.is_default) || addressList[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addressList, selectedAddressId]);

  const handleGoToCheckout = () => {
    if (items.length === 0) return;
    if (!user) {
      navigate('/login?redirect=/carrito');
      return;
    }
    navigate('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    const url = WhatsAppService.getCartSummaryUrl(
      items, 
      finalTotal,
      settings?.general?.supportPhone
    );
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#020617] text-white min-h-screen font-poppins pb-24 pt-32 selection:bg-brand-primary/30">
      <SEO title="Tu Carrito Elite | Garabito Shop" />
      
      {/* Visual Depth Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container-custom px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                <ShoppingBag size={20} className="text-brand-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Tu Selección</h1>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">
              {totalItems} Artículos en la bolsa <span className="text-brand-primary">Elite</span>
            </p>
          </div>

          <Link to="/catalogo" className="group flex items-center gap-3 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5 hover:border-brand-primary/20">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Continuar Explorando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Listado de Productos */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-32 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 backdrop-blur-xl"
                >
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                      <ShoppingCart className="w-10 h-10 text-slate-700" />
                   </div>
                   <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Bolsa Vacía</h2>
                   <p className="text-slate-500 text-sm max-w-xs mx-auto mb-10 font-medium">Parece que aún no has agregado hardware de alto rendimiento a tu selección.</p>
                   <Link to="/catalogo" className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest inline-flex items-center gap-3 shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-all">
                    Ver Catálogo Elite <Zap size={14} className="fill-current" />
                   </Link>
                </motion.div>
              ) : items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  className="group relative bg-white/[0.03] border border-white/5 p-5 sm:p-8 rounded-[2.5rem] flex flex-col sm:flex-row gap-8 hover:bg-white/[0.05] hover:border-brand-primary/20 transition-all shadow-xl backdrop-blur-3xl overflow-hidden"
                >
                  {/* Item Background Glow */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-all" />

                  <div className="w-full sm:w-40 h-48 sm:h-40 shrink-0 bg-black/40 rounded-3xl border border-white/5 p-6 flex items-center justify-center relative z-10 group-hover:border-brand-primary/30 transition-all">
                    <img src={getAssetUrl(item.images?.[0])} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">{item.brand}</span>
                        <h3 className="text-xl font-black leading-[1.1] uppercase tracking-tight group-hover:text-white transition-colors">{item.name}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center border border-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-8 gap-6">
                      <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1.5 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-black text-lg tracking-tighter">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.stock || 99)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white disabled:opacity-20"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Precio Unitario: RD$ {(item.discountPrice || item.price).toLocaleString()}</p>
                        <p className="text-3xl font-black tracking-tighter text-white">
                          <span className="text-xs text-brand-primary align-top mr-1">RD$</span>
                          {(item.quantity * (item.discountPrice || item.price)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Resumen de Compra */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0B0F1A]/80 border border-white/10 p-8 sm:p-10 rounded-[3rem] sticky top-32 space-y-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                 <h3 className="text-2xl font-black tracking-tighter uppercase">Cálculo Total</h3>
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Destino de Envío:</label>
                   <Link to="/cuenta/direcciones" className="text-[9px] font-black text-brand-primary uppercase hover:underline tracking-widest">Cambiar</Link>
                </div>

                {!isLoadingAddresses && addressList.length > 0 ? (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                       <MapPin className="text-brand-primary w-4 h-4" />
                    </div>
                    <select 
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-10 text-[11px] font-bold text-white appearance-none outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all cursor-pointer"
                    >
                      {addressList.map((addr: Address) => (
                        <option key={addr.id} value={addr.id} className="bg-[#0B0F1A]">
                          {addr.sector} — {addr.first_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-white transition-colors" />
                  </div>
                ) : !isLoadingAddresses && (
                   <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start gap-4">
                      <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Dirección faltante</p>
                        <p className="text-[9px] font-bold text-amber-200/40 uppercase tracking-tighter">Agrega una ubicación en Santo Domingo para procesar el envío.</p>
                      </div>
                   </div>
                )}
              </div>

              <div className="space-y-5 py-8 border-y border-white/5">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-500">
                  <span className="text-[10px] tracking-[0.2em]">Suma Parcial</span>
                  <span className="text-white text-base">RD$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-500">
                  <span className="text-[10px] tracking-[0.2em]">Logística (Express)</span>
                  <span className={shipping === 0 ? 'text-emerald-500 text-base' : 'text-white text-base'}>
                    {shipping === 0 ? 'BONIFICADO' : `RD$ ${shipping.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex flex-col items-center text-center mb-10">
                   <span className="font-black text-gray-500 uppercase text-[10px] tracking-[0.4em] mb-3">Inversión Final</span>
                   <div className="flex items-baseline gap-2">
                     <span className="text-xl font-black text-brand-primary">RD$</span>
                     <span className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                       {finalTotal.toLocaleString()}
                     </span>
                   </div>
                   <span className="text-[9px] text-emerald-500/60 font-black uppercase tracking-[0.3em] mt-3">Seguridad y Garantía Incluida</span>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleGoToCheckout}
                    disabled={items.length === 0}
                    className="group relative w-full py-7 bg-brand-primary text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Zap size={18} className="fill-current" />
                    PROCEDER AL PAGO
                  </button>

                  <button 
                    onClick={handleWhatsAppCheckout}
                    disabled={items.length === 0}
                    className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    <MessageCircle size={16} />
                    Consultar por WhatsApp
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-3 text-[9px] font-black text-gray-600 uppercase justify-center tracking-[0.2em]">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" /> Pago Procesado con Seguridad Elite
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {[
                 { icon: <Truck className="w-5 h-5" />, label: 'Entrega VIP' },
                 { icon: <ShieldCheck className="w-5 h-5" />, label: 'Certificado' },
                 { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Auténtico' }
               ].map((feat, i) => (
                 <div key={i} className="flex flex-col items-center p-5 bg-white/[0.02] rounded-3xl border border-white/5 backdrop-blur-sm group hover:border-brand-primary/20 transition-all">
                    <div className="text-brand-primary mb-2 group-hover:scale-110 transition-transform">{feat.icon}</div>
                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">{feat.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
