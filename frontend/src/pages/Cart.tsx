import React, { useState, useMemo } from 'react';
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
  ShoppingBag,
  Map as MapIcon,
  X,
  Navigation
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserAddresses } from '../hooks/useUserAccount';
import { useSettings } from '../hooks/useSettings';
import SEO from '../components/common/SEO';
import { WhatsAppService } from '../services/WhatsAppService';
import { getAssetUrl } from '../utils/asset';
import MapPickerInline from '../components/common/MapPickerInline';
import type { Address } from '../types';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const { user } = useAuthStore();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const { data: addresses, isLoading: isLoadingAddresses } = useUserAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [manualLocation, setManualLocation] = useState<any>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const addressList = Array.isArray(addresses) ? addresses : (addresses as any)?.data || [];

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const shippingInfo = useMemo(() => {
    const fallback = { cost: 250, isFree: false, zoneName: 'Estándar' };

    // 1. Obtener ubicación de referencia (dirección seleccionada o manual del mapa)
    let locationRef: any = null;
    if (manualLocation) {
      locationRef = manualLocation;
    } else if (selectedAddressId) {
      locationRef = addressList.find((a: Address) => a.id === selectedAddressId);
    }

    if (!locationRef || !settings?.shipping?.zones) return fallback;

    // 2. Buscar zona coincidente
    const zones = settings.shipping.zones;
    const match = zones.find((z: any) =>
      locationRef.sector?.toLowerCase().includes(z.name.toLowerCase()) ||
      locationRef.municipio?.toLowerCase().includes(z.name.toLowerCase()) ||
      locationRef.provincia?.toLowerCase().includes(z.name.toLowerCase()) ||
      z.name.toLowerCase().includes(locationRef.sector?.toLowerCase() || '') ||
      z.name.toLowerCase().includes(locationRef.municipio?.toLowerCase() || '')
    );

    if (!match) return fallback;

    const isFree = totalPrice >= match.freeFrom;
    return {
      cost: isFree ? 0 : match.cost,
      isFree,
      zoneName: match.name
    };
  }, [selectedAddressId, manualLocation, addressList, settings, totalPrice]);

  const shipping = shippingInfo.cost;
  const finalTotal = totalPrice + shipping;

  React.useEffect(() => {
    if (addressList.length > 0 && selectedAddressId === null && !manualLocation) {
      const defaultAddr = addressList.find((a: Address) => a.is_default) || addressList[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addressList, selectedAddressId, manualLocation]);

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
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen font-poppins pb-32 pt-28 sm:pt-32 selection:bg-brand-primary/30 transition-colors duration-500">
      <SEO title="Tu Carrito Elite | Garabito Shop" />
      
      {/* Visual Depth Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-light-surface dark:bg-[#0B0F1A] w-full max-w-4xl h-[85vh] sm:h-[80vh] rounded-[2rem] sm:rounded-[3rem] border border-light-border dark:border-white/10 shadow-3xl overflow-hidden flex flex-col"
            >
              <div className="p-5 sm:p-6 border-b border-light-border dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                    <MapIcon size={18} className="text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-light-text dark:text-white">Seleccionar Ubicación</h3>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Para calcular el costo de envío exacto</p>
                  </div>
                </div>
                <button onClick={() => setShowMapModal(false)} className="p-2 text-slate-400 hover:text-brand-primary transition-colors bg-light-border dark:bg-white/5 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 relative">
                <MapPickerInline
                  value={manualLocation ? { lat: manualLocation.lat, lng: manualLocation.lng, addressText: manualLocation.addressText } : { lat: 18.4861, lng: -69.9312, addressText: '' }}
                  onChange={(loc) => {
                    setManualLocation(loc);
                    setSelectedAddressId(null);
                  }}
                />
              </div>

              <div className="p-6 sm:p-8 bg-light-surface dark:bg-black/40 backdrop-blur-xl border-t border-light-border dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0 text-center sm:text-left">
                   <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">Ubicación Detectada</p>
                   <p className="text-xs sm:text-sm font-bold text-light-text dark:text-white truncate italic max-w-full">
                     {manualLocation?.addressText || 'Mueve el pin en el mapa...'}
                   </p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  disabled={!manualLocation}
                  className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/30 disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container-custom px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                <ShoppingBag size={20} className="text-brand-primary" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-light-text dark:text-white">Tu Selección</h1>
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em] ml-1">
              {totalItems} Artículos en la bolsa <span className="text-brand-primary">Elite</span>
            </p>
          </div>

          <Link to="/" className="group flex items-center justify-center gap-3 text-[9px] font-black uppercase text-slate-500 dark:text-gray-500 hover:text-brand-primary dark:hover:text-white transition-all tracking-[0.2em] bg-light-surface dark:bg-white/5 px-6 py-4 rounded-2xl border border-light-border dark:border-white/5 hover:border-brand-primary/20">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Continuar Explorando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Listado de Productos */}
          <div className={`${items.length === 0 ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4 sm:space-y-6`}>
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 sm:py-32 text-center bg-light-surface dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-light-border dark:border-white/10 backdrop-blur-xl"
                >
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-light-border dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-light-border dark:border-white/5 shadow-inner">
                      <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-700" />
                   </div>
                   <h2 className="text-2xl sm:text-3xl font-black uppercase mb-4 tracking-tighter text-light-text dark:text-white">Bolsa Vacía</h2>
                   <p className="text-slate-500 dark:text-slate-500 text-xs sm:text-sm max-w-xs mx-auto mb-8 sm:mb-10 font-medium px-4">Parece que aún no has agregado hardware de alto rendimiento a tu selección.</p>
                   <Link to="/" className="bg-brand-primary text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest inline-flex items-center gap-3 shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-all">
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
                  className="group relative bg-light-surface dark:bg-white/[0.03] border border-light-border dark:border-white/5 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col sm:flex-row gap-4 sm:gap-8 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] hover:border-brand-primary/20 transition-all shadow-xl dark:shadow-2xl backdrop-blur-3xl overflow-hidden"
                >
                  {/* Item Background Glow */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-all" />

                  <div className="w-full sm:w-40 h-40 shrink-0 bg-slate-100 dark:bg-black/40 rounded-2xl sm:rounded-3xl border border-light-border dark:border-white/5 p-4 sm:p-6 flex items-center justify-center relative z-10 group-hover:border-brand-primary/30 transition-all">
                    <img src={getAssetUrl(item.images?.[0])} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">{item.brand}</span>
                        <h3 className="text-lg sm:text-xl font-black leading-[1.1] uppercase tracking-tight text-light-text dark:text-white group-hover:text-brand-primary dark:group-hover:text-white transition-colors">{item.name}</h3>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-light-border dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center border border-light-border dark:border-white/5"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <div className="flex flex-row items-center justify-between mt-6 sm:mt-8 gap-4">
                      <div className="flex items-center bg-slate-100 dark:bg-black/40 border border-light-border dark:border-white/10 rounded-xl sm:rounded-2xl p-1 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/50 dark:hover:bg-white/10 rounded-lg sm:rounded-xl transition-all text-slate-400 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="w-8 sm:w-12 text-center font-black text-base sm:text-lg tracking-tighter text-light-text dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.stock || 99)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/50 dark:hover:bg-white/10 rounded-lg sm:rounded-xl transition-all text-slate-400 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white disabled:opacity-20"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <div className="text-right space-y-0.5 sm:space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Unit: RD$ {(item.discountPrice || item.price).toLocaleString()}</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tighter text-light-text dark:text-white">
                          <span className="text-[10px] sm:text-xs text-brand-primary align-top mr-1">RD$</span>
                          {(item.quantity * (item.discountPrice || item.price)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Resumen de Compra - Solo se muestra si hay productos */}
          {items.length > 0 && (
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-light-surface dark:bg-[#0B0F1A]/80 border border-light-border dark:border-white/10 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] sticky top-32 space-y-6 sm:space-y-10 shadow-glass-light dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-light-text dark:text-white">Cálculo Total</h3>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Destino de Envío:</label>
                    <button
                      onClick={() => setShowMapModal(true)}
                      className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase hover:underline tracking-widest flex items-center gap-1.5"
                    >
                      <MapIcon size={10} /> Cambiar mapa
                    </button>
                  </div>

                  {!isLoadingAddresses && addressList.length > 0 && !manualLocation ? (
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                        <MapPin className="text-brand-primary w-4 h-4" />
                      </div>
                      <select
                        value={selectedAddressId || ''}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                        className="w-full bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 rounded-2xl py-4 sm:py-5 pl-14 pr-10 text-[10px] sm:text-[11px] font-bold text-light-text dark:text-white appearance-none outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all cursor-pointer"
                      >
                        {addressList.map((addr: Address) => (
                          <option key={addr.id} value={addr.id} className="bg-light-surface dark:bg-[#0B0F1A] text-light-text dark:text-white">
                            {addr.alias || addr.sector} — {addr.first_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-600 pointer-events-none group-hover:text-brand-primary dark:group-hover:text-white transition-colors" />
                    </div>
                  ) : manualLocation ? (
                    <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[1.5rem] p-4 sm:p-5 flex items-center justify-between group relative overflow-hidden">
                      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg">
                          <Navigation size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase tracking-widest mb-0.5">Ubicación Manual</p>
                          <p className="text-[10px] sm:text-[11px] font-bold text-light-text dark:text-white truncate max-w-[120px] sm:max-w-[150px] italic">
                            {manualLocation.sector || manualLocation.municipio}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setManualLocation(null);
                          if (addressList.length > 0) setSelectedAddressId(addressList[0].id);
                        }}
                        className="relative z-10 p-2 text-slate-400 dark:text-gray-500 hover:text-brand-primary dark:hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all" />
                    </div>
                  ) : !isLoadingAddresses && (
                    <button
                      onClick={() => setShowMapModal(true)}
                      className="w-full p-4 sm:p-6 bg-light-surface dark:bg-white/5 border border-dashed border-light-border dark:border-white/10 rounded-[1.5rem] flex flex-col items-center gap-2 sm:gap-3 hover:bg-light-border dark:hover:bg-white/10 transition-all text-slate-400 dark:text-gray-500 hover:text-brand-primary dark:hover:text-white"
                    >
                        <MapIcon size={20} className="opacity-40" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Ubicar en el mapa</p>
                    </button>
                  )}
                </div>

                <div className="space-y-4 sm:space-y-5 py-6 sm:py-8 border-y border-light-border dark:border-white/5">
                  <div className="flex justify-between items-center text-[11px] sm:text-sm font-bold uppercase tracking-widest text-slate-500">
                    <span className="text-[9px] sm:text-[10px] tracking-[0.2em]">Suma Parcial</span>
                    <span className="text-light-text dark:text-white">RD$ {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] sm:text-sm font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] tracking-[0.2em]">Logística ({shippingInfo.zoneName})</span>
                      {shippingInfo.isFree && <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Bonificado</span>}
                    </div>
                    <span className={shippingInfo.isFree ? 'text-emerald-500' : 'text-light-text dark:text-white'}>
                      {shippingInfo.isFree ? 'GRATIS' : `RD$ ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
                    <span className="font-black text-slate-400 dark:text-gray-500 uppercase text-[9px] sm:text-[10px] tracking-[0.4em] mb-2 sm:mb-3">Inversión Final</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-black text-brand-primary">RD$</span>
                      <span className="text-4xl sm:text-6xl font-black tracking-tighter text-light-text dark:text-white drop-shadow-[0_0_30px_rgba(37,99,235,0.1)] dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {finalTotal.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-emerald-500/60 font-black uppercase tracking-[0.3em] mt-2 sm:mt-3">Seguridad y Garantía Incluida</span>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={handleGoToCheckout}
                      disabled={items.length === 0}
                      className="group relative w-full py-4 sm:py-6 bg-brand-primary text-white rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Zap size={18} className="fill-current" />
                      PROCEDER AL PAGO
                    </button>

                    <button
                      onClick={handleWhatsAppCheckout}
                      disabled={items.length === 0}
                      className="w-full py-3 sm:py-5 bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 text-light-text dark:text-white rounded-[1.25rem] sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                  </div>

                  <div className="mt-6 sm:mt-8 flex items-center gap-3 text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase justify-center tracking-[0.2em]">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" /> Seguridad Elite
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
