import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  Mail,
  Info,
  Navigation,
  Tag
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useCreateAddress } from '../../hooks/useUserAccount';
import { useAuthStore } from '../../store/useAuthStore';
import MapPickerInline from '../../components/common/MapPickerInline';
import SEO from '../../components/common/SEO';

const AddAddress: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createMutation = useCreateAddress();
  const addNotification = useNotificationStore(state => state.addNotification);

  const [isResolving, setIsResolving] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    alias: '',
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    email: user?.email || '',
    provincia: 'Santo Domingo',
    municipio: '',
    sector: '',
    calle: '',
    referencia: '',
    latitude: 18.4861,
    longitude: -69.9312,
    formatted_address: '',
    is_default: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress.alias) {
        addNotification('error', 'Por favor, asigna un nombre a esta ubicación (ej: Mi Casa).');
        return;
    }

    if (!newAddress.municipio || !newAddress.sector) {
        addNotification('error', 'Por favor, ubica tu dirección exacta en el mapa.');
        return;
    }

    try {
      await createMutation.mutateAsync(newAddress);
      addNotification('success', '¡Ubicación guardada con éxito!');
      navigate('/cuenta/direcciones');
    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      addNotification('error', serverMessage || 'Error al guardar la dirección.');
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-[#06080F] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl">
      <SEO title="Agregar Nueva Dirección | Garabito Shop" />

      {/* Top Header */}
      <header className="shrink-0 bg-white/50 dark:bg-[#0B0F1A]/50 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 px-6 py-4 md:py-5 z-[20]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cuenta/direcciones')}
            className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-brand-primary transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Nueva Ubicación</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configura tu punto de entrega express</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row relative overflow-hidden">

        {/* Sección del Mapa */}
        <div className="w-full h-[400px] lg:h-[650px] lg:flex-1 relative bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 shrink-0 lg:shrink">
           <div className="absolute inset-0">
             <MapPickerInline
                value={{ lat: newAddress.latitude, lng: newAddress.longitude, addressText: newAddress.formatted_address }}
                onResolving={setIsResolving}
                onChange={(loc) => setNewAddress({
                    ...newAddress, latitude: loc.lat, longitude: loc.lng, formatted_address: loc.addressText,
                    municipio: loc.municipio || '', sector: loc.sector || '', calle: loc.calle || ''
                })}
             />
           </div>
        </div>

        {/* Sección del Formulario */}
        <aside className="w-full lg:w-[480px] bg-white dark:bg-[#0B0F1A] flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-[#0B0F1A]/50">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Detalles de Envío</h2>
              </div>

              {/* Indicador visual de ubicación seleccionada */}
              <div className="grid grid-cols-3 gap-2 p-4 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-2xl border border-brand-primary/10">
                  <div className="space-y-1">
                      <label className="text-[7px] font-black text-brand-primary uppercase tracking-widest">Municipio</label>
                      <div className="text-[10px] font-black dark:text-white truncate">
                          {newAddress.municipio || <span className="text-slate-500 italic">Mueve...</span>}
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[7px] font-black text-brand-primary uppercase tracking-widest">Sector</label>
                      <div className="text-[10px] font-black dark:text-white truncate">
                          {newAddress.sector || <span className="text-slate-500 italic">Dect...</span>}
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[7px] font-black text-brand-primary uppercase tracking-widest">Calle</label>
                      <div className="text-[10px] font-black dark:text-white truncate">
                          {newAddress.calle || <span className="text-slate-500 italic">Dect...</span>}
                      </div>
                  </div>
              </div>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6 bg-slate-50/30 dark:bg-transparent">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de esta ubicación</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Mi Casa, Trabajo, Apartamento..."
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-[13px] font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  value={newAddress.alias}
                  onChange={(e) => setNewAddress({...newAddress, alias: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                  <input type="text" required className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-[13px] font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all" value={newAddress.first_name} onChange={(e) => setNewAddress({...newAddress, first_name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellido</label>
                <input type="text" required className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 text-[13px] font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all" value={newAddress.last_name} onChange={(e) => setNewAddress({...newAddress, last_name: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input type="tel" required placeholder="829-000-0000" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-[13px] font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} />
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input type="email" required className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-[13px] font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all" value={newAddress.email} onChange={(e) => setNewAddress({...newAddress, email: e.target.value})} />
                  </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia exacta de llegada</label>
              <textarea required placeholder="Ej. Casa de 2 niveles, portón negro frente al parque..." className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-[13px] font-bold dark:text-white resize-none outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all leading-relaxed" rows={3} value={newAddress.referencia} onChange={(e) => setNewAddress({...newAddress, referencia: e.target.value})} />
              <div className="flex items-center gap-2 mt-2 px-2">
                  <Info size={12} className="text-brand-primary shrink-0" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Detalles visibles ayudan a una entrega más rápida.</p>
              </div>
            </div>

            <div className="pt-4 pb-8">
              <button
                type="submit"
                disabled={createMutation.isPending || isResolving}
                className="w-full py-5 bg-brand-primary text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {createMutation.isPending || isResolving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
                {isResolving ? 'Precisando Ubicación...' : 'Confirmar Dirección'}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default AddAddress;
