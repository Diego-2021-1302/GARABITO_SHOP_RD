import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Home, CheckCircle2, X, Loader2, Star, Navigation2, Info, Mail } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useUserAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from '../../hooks/useUserAccount';
import { useAuthStore } from '../../store/useAuthStore';
import MapPickerInline from '../../components/common/MapPickerInline';
import SEO from '../../components/common/SEO';
import type { Address } from '../../types';

const UserAddresses: React.FC = () => {
  const { user } = useAuthStore();
  const { data: addresses, isLoading } = useUserAddresses();
  const createMutation = useCreateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    email: user?.email || '',
    provincia: 'Santo Domingo',
    municipio: '',
    sector: '',
    referencia: '',
    latitude: 18.4861,
    longitude: -69.9312,
    formatted_address: '',
    is_default: false
  });

  const addNotification = useNotificationStore(state => state.addNotification);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAddress.municipio || !newAddress.sector) {
        addNotification('error', 'Por favor, ubica tu dirección en el mapa.');
        return;
    }

    try {
      await createMutation.mutateAsync(newAddress);
      addNotification('success', '¡Ubicación guardada con éxito!');
      setIsAdding(false);
      resetForm();
    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      const errors = error.response?.data?.errors;
      console.error("Error al guardar:", errors);
      addNotification('error', serverMessage || 'Error de validación. Revisa los datos.');
    }
  };

  const resetForm = () => {
    setNewAddress({
        type: 'shipping', 
        first_name: user?.name?.split(' ')[0] || '',
        last_name: user?.name?.split(' ').slice(1).join(' ') || '',
        phone: user?.phone || '',
        email: user?.email || '',
        provincia: 'Santo Domingo',
        municipio: '', sector: '', referencia: '', latitude: 18.4861, longitude: -69.9312,
        formatted_address: '', is_default: false
    });
  };

  const addressList = Array.isArray(addresses) ? addresses : (addresses as any)?.data || [];

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0">
      <SEO title="Mis Direcciones | Garabito Shop" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Mis Ubicaciones</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Donde recibes tus compras</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Dirección
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {addressList.length === 0 ? (
              <div className="col-span-full py-20 bg-slate-50 dark:bg-white/[0.02] rounded-[40px] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center px-10">
                <Navigation2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">No tienes direcciones</h3>
                <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Agrega una para agilizar tus pedidos.</p>
              </div>
            ) : addressList.map((addr: Address) => (
              <motion.div
                key={addr.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-white dark:bg-[#0B0F1A] p-8 rounded-[32px] border-2 transition-all ${
                  addr.is_default ? 'border-brand-primary shadow-xl shadow-brand-primary/10' : 'border-slate-100 dark:border-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${addr.is_default ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}>
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-xl truncate max-w-[150px]">{addr.sector}</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{addr.municipio}</span>
                    </div>
                  </div>
                  {!addr.is_default && (
                    <button onClick={() => deleteMutation.mutate(addr.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>

                <div className="p-5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/10 mb-6">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed uppercase italic truncate">
                      "{addr.referencia}"
                    </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                   <span className="text-xs font-black dark:text-white uppercase tracking-tight">{addr.first_name} {addr.last_name}</span>
                   {addr.is_default ? (
                      <span className="text-[8px] font-black uppercase text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Principal
                      </span>
                   ) : (
                     <button onClick={() => setDefaultMutation.mutate(addr.id)} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:scale-105 transition-all">Definir principal</button>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL UX PREMIUM */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0B0F1A] w-full max-w-6xl h-full md:h-[85vh] overflow-hidden md:rounded-[40px] shadow-2xl relative z-10 flex flex-col md:flex-row border border-white/10"
            >
              <div className="flex-1 bg-slate-100 dark:bg-brand-dark relative order-2 md:order-1 h-[40vh] md:h-auto">
                 <MapPickerInline 
                    value={{ lat: newAddress.latitude, lng: newAddress.longitude, addressText: newAddress.formatted_address }}
                    onResolving={setIsResolving}
                    onChange={(loc) => setNewAddress({ 
                        ...newAddress, latitude: loc.lat, longitude: loc.lng, formatted_address: loc.addressText,
                        municipio: loc.municipio || '', sector: loc.sector || ''
                    })}
                 />
              </div>

              <div className="w-full md:w-[450px] p-8 md:p-10 overflow-y-auto custom-scrollbar order-1 md:order-2 bg-white dark:bg-[#0B0F1A]">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Detalles de Entrega</h2>
                  <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Municipio</label>
                        <div className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-4 px-5 text-xs font-bold dark:text-white/60 truncate italic">
                            {newAddress.municipio || 'Detectando...'}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector</label>
                        <div className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-4 px-5 text-xs font-bold dark:text-white/60 truncate italic">
                            {newAddress.sector || 'Detectando...'}
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                      <input type="text" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl py-4 px-5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20" value={newAddress.first_name} onChange={(e) => setNewAddress({...newAddress, first_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellido</label>
                      <input type="text" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl py-4 px-5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20" value={newAddress.last_name} onChange={(e) => setNewAddress({...newAddress, last_name: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                        <input type="tel" required placeholder="809-000-0000" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl py-4 px-5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input type="email" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl py-4 px-5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20" value={newAddress.email} onChange={(e) => setNewAddress({...newAddress, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia exacta de llegada</label>
                    <textarea required placeholder="Ej. Casa de 2 niveles, portón negro..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl py-4 px-5 text-xs font-bold dark:text-white resize-none outline-none focus:ring-2 focus:ring-brand-primary/20" rows={2} value={newAddress.referencia} onChange={(e) => setNewAddress({...newAddress, referencia: e.target.value})} />
                  </div>

                  <button 
                    type="submit" disabled={createMutation.isPending || isResolving}
                    className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (isResolving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />)}
                    {isResolving ? 'Precisando Ubicación...' : 'Confirmar Dirección'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAddresses;
