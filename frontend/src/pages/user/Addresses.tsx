import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Trash2,
  Navigation2,
  Navigation,
  Check,
  User,
  Phone,
  ChevronRight,
  Loader2,
  Tag,
  AlertTriangle,
  X
} from 'lucide-react';
import { useUserAddresses, useDeleteAddress, useSetDefaultAddress } from '../../hooks/useUserAccount';
import { useNotificationStore } from '../../store/useNotificationStore';
import SEO from '../../components/common/SEO';
import type { Address } from '../../types';

const UserAddresses: React.FC = () => {
  const navigate = useNavigate();
  const { data: addresses, isLoading } = useUserAddresses();
  const addNotification = useNotificationStore(state => state.addNotification);

  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addressList = Array.isArray(addresses) ? addresses : (addresses as any)?.data || [];

  // Identificar la última agregada (ID más alto)
  const lastAddedId = addressList.length > 0
    ? [...addressList].sort((a, b) => b.id - a.id)[0].id
    : null;

  const handleDeleteClick = (id: number) => {
    if (id === lastAddedId) {
      addNotification('warning', 'No puedes eliminar la última ubicación agregada.');
      return;
    }
    setAddressToDelete(id);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteMutation.mutateAsync(addressToDelete);
      addNotification('success', 'Dirección eliminada correctamente');
    } catch (error) {
      addNotification('error', 'Error al eliminar la dirección');
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      addNotification('success', 'Dirección principal actualizada');
    } catch (error) {
      addNotification('error', 'Error al actualizar la dirección principal');
    }
  };

  return (
    <div className="space-y-10 pb-24 relative">
      <SEO title="Mis Direcciones | Garabito Shop" />

      {/* Modal de Confirmación Gráfico */}
      <AnimatePresence>
        {addressToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddressToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 shadow-2xl overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setAddressToDelete(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-50 dark:bg-white/5 rounded-full">
                    <X size={16} />
                  </button>
               </div>

               <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <AlertTriangle size={40} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">¿Eliminar Ubicación?</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      Esta acción no se puede deshacer. La dirección se borrará permanentemente de tu cuenta.
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-3 pt-4">
                    <button
                      onClick={confirmDelete}
                      disabled={deleteMutation.isPending}
                      className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 size={18} />}
                      Sí, Eliminar Ahora
                    </button>
                    <button
                      onClick={() => setAddressToDelete(null)}
                      className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                      No, Mantener
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Premium Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-lg shadow-brand-primary/5">
              <Navigation className="text-brand-primary w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Mis Ubicaciones</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gestión de entrega en Santo Domingo</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/cuenta/direcciones/nueva')}
          className="group relative flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Nueva Dirección
        </button>
      </div>

      {/* Grid de Direcciones */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-white dark:bg-white/5 animate-pulse rounded-[2.5rem] border border-slate-100 dark:border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {addressList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-32 bg-white/[0.01] dark:bg-white/[0.01] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center px-10 backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-50" />
                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner relative z-10">
                  <Navigation2 className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight relative z-10">Sin direcciones registradas</h3>
                <p className="text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-[0.2em] max-w-xs relative z-10 leading-relaxed">Agrega una ubicación exacta para agilizar tus pedidos y disfrutar de nuestras entregas express.</p>
              </motion.div>
            ) : addressList.map((addr: Address) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative bg-white dark:bg-[#0B0F1A]/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col h-full overflow-hidden ${
                  addr.is_default
                    ? 'border-brand-primary shadow-[0_30px_60px_-15px_rgba(37,99,235,0.2)]'
                    : 'border-slate-100 dark:border-white/5 hover:border-brand-primary/40'
                }`}
              >
                {/* Glow Background */}
                {addr.is_default && <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />}

                {/* Status Badge */}
                <div className="absolute top-8 right-8 flex gap-2 z-10">
                   {addr.is_default && (
                      <div className="bg-brand-primary text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg shadow-brand-primary/20 flex items-center gap-1.5">
                        <Check size={10} strokeWidth={4} /> Principal
                      </div>
                   )}
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all duration-500 ${
                    addr.is_default
                      ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
                  }`}>
                    {addr.alias ? <Tag className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-3xl md:text-4xl truncate">
                      {addr.alias || addr.sector}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                         {addr.alias ? addr.sector + ', ' : ''}{addr.municipio}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6 relative z-10">
                  <div className="p-5 bg-slate-50/50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 relative group-hover:bg-white/[0.05] transition-colors min-h-[5rem] overflow-y-auto custom-scrollbar">
                      <div className="flex flex-col gap-1 mb-3">
                         <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Ubicación Exacta</p>
                         <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase italic">
                            {addr.calle ? `${addr.calle}, ` : ''}{addr.sector}, {addr.municipio}, {addr.provincia}
                         </p>
                      </div>
                      <div className="flex flex-col gap-1">
                         <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Punto de Referencia</p>
                         <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase italic">
                           "{addr.referencia}"
                         </p>
                      </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <div className="w-7 h-7 rounded-lg bg-brand-primary/5 flex items-center justify-center">
                        <User size={12} className="text-brand-primary" />
                      </div>
                      <span className="truncate">{addr.first_name} {addr.last_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <div className="w-7 h-7 rounded-lg bg-brand-primary/5 flex items-center justify-center">
                        <Phone size={12} className="text-brand-primary" />
                      </div>
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 dark:border-white/5">
                   {!addr.is_default ? (
                     <button
                       onClick={() => handleSetDefault(addr.id)}
                       disabled={setDefaultMutation.isPending}
                       className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:bg-brand-primary hover:text-white px-5 py-2.5 rounded-xl transition-all border border-brand-primary/20 disabled:opacity-50"
                     >
                       {setDefaultMutation.isPending && setDefaultMutation.variables === addr.id ? (
                         <Loader2 size={12} className="animate-spin" />
                       ) : (
                         <>Definir Principal <ChevronRight size={12} /></>
                       )}
                     </button>
                   ) : (
                     <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl">
                        <Check size={12} /> Configurada
                     </div>
                   )}

                   {addr.id !== lastAddedId && (
                    <button
                      onClick={() => handleDeleteClick(addr.id)}
                      disabled={deleteMutation.isPending}
                      className="ml-auto p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                      title="Eliminar dirección"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === addr.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default UserAddresses;
