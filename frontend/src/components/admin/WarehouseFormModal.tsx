import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
import type { Warehouse } from '../../types';

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
  onSubmit: (data: Partial<Warehouse>) => Promise<void>;
  isLoading: boolean;
}

const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({ isOpen, onClose, warehouse, onSubmit, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Warehouse>>();

  useEffect(() => {
    if (warehouse) {
      reset(warehouse);
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        address: '',
        manager: '',
        is_active: true,
      });
    }
  }, [warehouse, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0B0F1A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {warehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Nombre</label>
              <input
                {...register('name', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Nombre del almacén"
              />
              {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Código</label>
              <input
                {...register('code', { required: 'Este campo es requerido' })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
                placeholder="Ej. WH-01"
              />
              {errors.code && <span className="text-[10px] text-red-500">{errors.code.message}</span>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Dirección</label>
            <input
              {...register('address')}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              placeholder="Dirección del almacén"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Encargado</label>
            <input
              {...register('manager')}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              placeholder="Nombre del responsable"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Descripción</label>
            <textarea
              {...register('description')}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white min-h-[100px]"
              placeholder="Notas internas del almacén"
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
              Activo
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
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseFormModal;
