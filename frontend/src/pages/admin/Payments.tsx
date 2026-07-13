import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Loader2,
  Receipt,
  Trash2,
  AlertCircle,
  Calendar,
  Filter,
  Building2,
  DollarSign,
  Hash,
  X,
  CheckCircle2
} from 'lucide-react';
import { usePurchasePayments, useCreatePurchasePayment, useDeletePurchasePayment } from '../../hooks/usePurchasePayments';
import { usePurchaseInvoices } from '../../hooks/usePurchaseInvoices';
import SEO from '../../components/common/SEO';
import { useNotificationStore } from '../../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { PurchasePayment, PurchaseInvoice } from '../../types';

const AdminPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    purchase_invoice_id: '',
    amount: '',
    bank_name: '',
    transaction_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const addNotification = useNotificationStore(state => state.addNotification);
  
  // Data Fetching
  const { data: paymentsData, isLoading: isLoadingPayments } = usePurchasePayments({ search: searchTerm });
  const { data: pendingInvoicesData } = usePurchaseInvoices({ status: 'pending', sort: 'due_date', direction: 'asc' });
  const { data: overdueInvoicesData } = usePurchaseInvoices({ status: 'overdue', sort: 'due_date', direction: 'asc' });

  const createMutation = useCreatePurchasePayment();
  const deleteMutation = useDeletePurchasePayment();

  const selectableInvoices = useMemo(() => {
    const pending = pendingInvoicesData?.data || [];
    const overdue = overdueInvoicesData?.data || [];
    return [...overdue, ...pending];
  }, [pendingInvoicesData, overdueInvoicesData]);

  const handleInvoiceChange = (invoiceId: string) => {
    const selected = selectableInvoices.find(inv => inv.id === parseInt(invoiceId));
    setFormData(prev => ({
      ...prev,
      purchase_invoice_id: invoiceId,
      amount: selected ? selected.total_amount.toString() : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purchase_invoice_id || !formData.amount || !formData.bank_name || !formData.transaction_number) {
      addNotification('error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      addNotification('success', 'Pago registrado correctamente. La factura ha sido marcada como pagada.');
      setIsModalOpen(false);
      setFormData({
        purchase_invoice_id: '',
        amount: '',
        bank_name: '',
        transaction_number: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      addNotification('error', 'Error al registrar el pago');
    }
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    try {
      await deleteMutation.mutateAsync(paymentToDelete);
      addNotification('success', 'Registro de pago eliminado');
      setPaymentToDelete(null);
    } catch (error) {
      addNotification('error', 'Error al eliminar el pago');
    }
  };

  const banks = [
    'Banco Popular Dominicano',
    'Banco de Reservas (Banreservas)',
    'Banco BHD',
    'Banco Santa Cruz',
    'Scotiabank',
    'Banco Promerica',
    'Asociación Popular (APAP)'
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4 md:px-8">
      <SEO title="Gestión de Pagos a Proveedores | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            Pagos a Proveedores
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Historial de Transacciones y Liquidación de Facturas
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Registrar Nuevo Pago
        </button>
      </div>

      {/* FILTRO BUSQUEDA */}
      <section className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[32px] p-6 shadow-sm">
        <div className="max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" placeholder="Buscar por no. transferencia o factura..." 
            className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-10 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* TABLA DE PAGOS */}
      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingPayments ? (
            <div className="p-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando Historial...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-[2px] font-black bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-6">Fecha</th>
                  <th className="px-8 py-6">Factura</th>
                  <th className="px-8 py-6">Proveedor</th>
                  <th className="px-8 py-6">Banco / Referencia</th>
                  <th className="px-8 py-6 text-right">Monto Pagado</th>
                  <th className="px-8 py-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {paymentsData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <Receipt className="w-12 h-12 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400 uppercase italic">No hay registros de pagos</p>
                      </div>
                    </td>
                  </tr>
                ) : paymentsData?.data?.map((payment: PurchasePayment) => (
                  <tr key={payment.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {new Date(payment.payment_date).toLocaleDateString('es-DO')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-800 dark:text-white text-sm">
                        #{payment.purchase_invoice?.invoice_number}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-slate-700 dark:text-gray-300 text-xs uppercase">
                        {payment.purchase_invoice?.provider?.commercial_name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 dark:text-gray-200">{payment.bank_name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: {payment.transaction_number}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        RD$ {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setPaymentToDelete(payment.id)}
                        className="p-2.5 bg-red-500/5 text-red-500/40 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar Registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL REGISTRO DE PAGO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0B0F1A] w-full max-w-lg rounded-[32px] p-8 relative z-10 border border-slate-200 dark:border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Registrar Pago</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vincular transferencia a factura</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Seleccionar Factura Pendiente</label>
                  <div className="relative">
                    <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={formData.purchase_invoice_id}
                      onChange={(e) => handleInvoiceChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold dark:text-white appearance-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
                      required
                    >
                      <option value="">Seleccione una factura...</option>
                      {selectableInvoices.map((inv: PurchaseInvoice) => (
                        <option key={inv.id} value={inv.id}>
                          #{inv.invoice_number} - {inv.provider?.commercial_name} (RD$ {Number(inv.total_amount).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Banco</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={formData.bank_name}
                        onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold dark:text-white appearance-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
                        required
                      >
                        <option value="">Seleccione Banco...</option>
                        {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">No. Transferencia</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={formData.transaction_number}
                        onChange={(e) => setFormData({...formData, transaction_number: e.target.value})}
                        placeholder="Referencia"
                        className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Monto a Pagar</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Fecha de Pago</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Notas (Opcional)</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl p-4 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                    placeholder="Detalles adicionales del pago..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-5 bg-brand-primary text-white rounded-3xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {createMutation.isPending ? 'Procesando...' : 'Confirmar Registro de Pago'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINACION */}
      <AnimatePresence>
        {paymentToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPaymentToDelete(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0B0F1A] w-full max-w-sm rounded-[32px] p-8 relative z-10 border border-slate-200 dark:border-white/10 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">¿Eliminar Registro?</h3>
                <p className="text-xs font-bold text-slate-400 mt-3 leading-relaxed">
                  Esta acción eliminará el comprobante de pago. La factura vinculada permanecerá con su estado actual.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  <button onClick={() => setPaymentToDelete(null)} className="px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl font-black text-[10px] uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Cancelar</button>
                  <button onClick={handleDelete} className="px-6 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Eliminar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayments;
