import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
import type { Provider } from '../../types';
import { useCreateProvider, useUpdateProvider } from '../../hooks/useProviders';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
}

const ProviderFormModal: React.FC<ProviderFormModalProps> = ({ isOpen, onClose, provider }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Provider>>();
  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();
  const addNotification = useNotificationStore(state => state.addNotification);

  useEffect(() => {
    if (provider) {
      reset(provider);
    } else {
      reset({
        commercial_name: '',
        company_name: '',
        rnc: '',
        phone: '',
        email: '',
        address: '',
        contact_person: '',
        is_active: true,
        notes: ''
      });
    }
  }, [provider, reset]);

  const onSubmit = async (data: Partial<Provider>) => {
    try {
      if (provider) {
        await updateMutation.mutateAsync({ id: provider.id, data });
        addNotification('success', 'Proveedor actualizado correctamente');
      } else {
        await createMutation.mutateAsync(data);
        addNotification('success', 'Proveedor creado correctamente');
      }
      onClose();
    } catch (error) {
      addNotification('error', 'Ocurrió un error al guardar el proveedor');
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0B0F1A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {provider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Nombre Comercial</label>
              <input 
                {...register('commercial_name', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Ej. Suministros Garabito"
              />
              {errors.commercial_name && <span className="text-[10px] text-red-500">{errors.commercial_name.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Razón Social</label>
              <input 
                {...register('company_name', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Ej. Garabito Tech SRL"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">RNC</label>
              <input 
                {...register('rnc', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Ej. 131-12345-6"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Teléfono</label>
              <input 
                {...register('phone', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Ej. 809-555-0123"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Email</label>
              <input 
                type="email"
                {...register('email', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="proveedor@ejemplo.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Persona de Contacto</label>
              <input 
                {...register('contact_person', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Nombre del contacto"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Dirección</label>
            <input 
              {...register('address', { required: 'Este campo es requerido' })}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              placeholder="Av. Churchill #123, Santo Domingo"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Observaciones</label>
            <textarea 
              {...register('notes')}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white min-h-[80px]"
              placeholder="Notas adicionales sobre el proveedor..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-gray-300">
              Este proveedor está activo
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {provider ? 'Actualizar' : 'Crear'} Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderFormModal;
