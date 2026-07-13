import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Ticket, 
  Trash2, 
  Edit, 
  Calendar, 
  Percent, 
  DollarSign,
  X,
  Save,
  Clock,
  Filter
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../../hooks/useCoupons';
import SEO from '../../components/common/SEO';

const AdminCoupons: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const addNotification = useNotificationStore(state => state.addNotification);

  const { data: couponsRes, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const code = (form.querySelector('[name=code]') as HTMLInputElement).value;
    const type = (form.querySelector('[name=type]') as HTMLSelectElement).value;
    const value = Number((form.querySelector('[name=value]') as HTMLInputElement).value);
    const limit = Number((form.querySelector('[name=limit]') as HTMLInputElement).value || 0);
    const expiry = (form.querySelector('[name=expiry]') as HTMLInputElement).value || null;

    const payload: any = {
      code,
      discount_type: type,
      discount_value: value,
      max_uses: limit || null,
      expires_at: expiry || null,
    };

    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, data: payload });
        addNotification('success', 'Cupón actualizado');
      } else {
        await createCoupon.mutateAsync(payload);
        addNotification('success', 'Cupón creado');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      addNotification('error', 'Error al guardar el cupón');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Cupones | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cupones</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Gestiona códigos de descuento y promociones</p>
        </div>
        <button 
          onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cupón
        </button>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cupón..." 
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium dark:text-gray-300">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Descuento</th>
                <th className="px-6 py-4">Uso</th>
                <th className="px-6 py-4">Expiración</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(couponsRes?.data ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No hay cupones registrados.</td></tr>
              )}
              {(couponsRes?.data ?? []).map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-white uppercase font-mono">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                      {coupon.discount_type === 'percentage' ? (
                        <><Percent className="w-4 h-4 text-brand-primary" /> {coupon.discount_value}%</>
                      ) : (
                        <><DollarSign className="w-4 h-4 text-emerald-500" /> RD$ {coupon.discount_value.toLocaleString()}</>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-slate-400">{coupon.uses_count || 0}/{coupon.max_uses || '∞'}</span>
                        <span className="text-brand-primary">
                          {coupon.max_uses ? `${Math.round(((coupon.uses_count || 0) / coupon.max_uses) * 100)}%` : ''}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary" 
                          style={{ width: coupon.max_uses ? `${((coupon.uses_count || 0) / coupon.max_uses) * 100}%` : '0%' }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Nunca'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                      coupon.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'
                    }`}>
                      {coupon.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setEditingCoupon(coupon); setIsModalOpen(true); }} 
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('¿Eliminar cupón?')) {
                            try {
                              await deleteCoupon.mutateAsync(coupon.id);
                              addNotification('success', 'Cupón eliminado');
                            } catch (err: any) {
                              addNotification('error', 'Error al eliminar');
                            }
                          }
                        }} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0B0F1A] w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-white/10">
              <form onSubmit={handleSave} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código</label>
                    <input name="code" type="text" required defaultValue={editingCoupon?.code} placeholder="PROMO2025" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white uppercase font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
                      <select name="type" defaultValue={editingCoupon?.discount_type ?? 'percentage'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white">
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto Fijo (RD$)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</label>
                      <input name="value" type="number" required defaultValue={editingCoupon?.discount_value} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Máx. Usos</label>
                      <input name="limit" type="number" defaultValue={editingCoupon?.max_uses} placeholder="Ej. 100" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiración</label>
                      <input name="expiry" type="date" defaultValue={editingCoupon?.expires_at ? editingCoupon.expires_at.split('T')[0] : ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-primary text-white py-3.5 mt-8 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoupons;
