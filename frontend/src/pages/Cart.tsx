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
  MessageCircle
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserAddresses } from '../hooks/useUserAccount';
import { useSettings } from '../hooks/useSettings';
import SEO from '../components/common/SEO';
import { WhatsAppService } from '../services/WhatsAppService';
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

  const resolveAssetUrl = (path: any) => {
    if (!path) return '/logo.png';

    // Extraer URL si es un objeto de relación
    const finalPath = typeof path === 'object' ? path.image_url : path;

    if (!finalPath) return '/logo.png';
    if (finalPath.startsWith('blob:') || finalPath.startsWith('data:')) return finalPath;

    // Limpiar barras duplicadas
    let cleanPath = finalPath.replace(/\/+/g, '/');

    if (cleanPath.includes('/storage/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/storage/'));
    } else if (!cleanPath.startsWith('http') && !cleanPath.startsWith('/')) {
      cleanPath = `/storage/${cleanPath}`;
    }

    return cleanPath;
  };

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
    <div className="bg-[#020617] text-white min-h-screen font-poppins pb-20 pt-32">
      <SEO title="Tu Carrito | Garabito Shop" />
      
      <div className="container-custom px-6">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Mi Carrito <span className="text-gray-600 ml-2 font-normal">({totalItems})</span></h1>
          <Link to="/catalogo" className="hidden sm:flex items-center gap-2 text-xs font-black uppercase text-brand-primary hover:text-white transition-colors tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Seguir comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <div className="py-20 text-center bg-[#0B0F1A] rounded-[32px] border border-white/5">
                   <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                   <h2 className="text-2xl font-black uppercase mb-4">El carrito está vacío</h2>
                   <Link to="/catalogo" className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest inline-block shadow-xl shadow-brand-primary/20">Explorar Catálogo</Link>
                </div>
              ) : items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0B0F1A] border border-white/5 p-6 rounded-[2rem] flex gap-6 group hover:border-white/10 transition-all shadow-xl"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[#020617] rounded-2xl border border-white/5 p-4 flex items-center justify-center">
                    <img src={resolveAssetUrl(item.images?.[0] || item.image_url)} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">{item.category?.name}</span>
                        <h3 className="text-lg font-black leading-tight uppercase tracking-tight mt-1">{item.name}</h3>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shadow-inner">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black tracking-tighter">RD$ {(item.quantity * (item.discount_price || item.price)).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0B0F1A] border border-white/5 p-8 rounded-[2.5rem] sticky top-32 space-y-8 shadow-2xl">
              <h3 className="text-xl font-black tracking-tight border-b border-white/5 pb-4 uppercase">Resumen</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar a:</label>
                   <Link to="/cuenta/direcciones" className="text-[9px] font-black text-brand-primary uppercase hover:underline">Gestionar</Link>
                </div>

                {!isLoadingAddresses && addressList.length > 0 ? (
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary w-4 h-4" />
                    <select 
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-xs font-bold text-white appearance-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
                    >
                      {addressList.map((addr: Address) => (
                        <option key={addr.id} value={addr.id} className="bg-[#0B0F1A]">
                          {addr.sector} - {addr.first_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-white transition-colors" />
                  </div>
                ) : !isLoadingAddresses && (
                   <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-amber-200/60 uppercase">Agrega una dirección para continuar.</p>
                   </div>
                )}
              </div>

              <div className="space-y-4 text-sm font-bold uppercase tracking-widest border-t border-white/5 pt-6">
                <div className="flex justify-between text-gray-500">
                  <span className="text-[10px]">Subtotal</span>
                  <span className="text-white">RD$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="text-[10px]">Envío</span>
                  <span className={shipping === 0 ? 'text-emerald-500' : 'text-white'}>
                    {shipping === 0 ? 'GRATIS' : `RD$ ${shipping.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex justify-between items-end mb-8">
                  <span className="font-black text-gray-500 uppercase text-xs tracking-widest">Total</span>
                  <span className="text-4xl font-black tracking-tighter text-brand-primary">RD$ {finalTotal.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleGoToCheckout}
                    disabled={items.length === 0}
                    className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    Realizar Compra
                  </button>

                  <button 
                    onClick={handleWhatsAppCheckout}
                    disabled={items.length === 0}
                    className="w-full py-5 bg-[#25D366] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Enviar por WhatsApp
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-gray-600 uppercase justify-center tracking-widest">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" /> Pago 100% Seguro
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
               {[
                 { icon: <Truck className="w-5 h-5" />, label: 'Express' },
                 { icon: <ShieldCheck className="w-5 h-5" />, label: 'Garantía' },
                 { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Original' }
               ].map((feat, i) => (
                 <div key={i} className="flex flex-col items-center p-4 bg-[#0B0F1A] rounded-3xl border border-white/5">
                    <div className="text-brand-primary mb-2">{feat.icon}</div>
                    <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">{feat.label}</span>
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
