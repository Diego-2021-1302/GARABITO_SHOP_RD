import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Loader2,
  FileText,
  Trash2,
  Edit,
  AlertCircle,
  Printer,
  Calendar,
  Filter,
  ArrowUpDown,
  Building2,
  Clock,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  usePurchaseInvoices, 
  useDeletePurchaseInvoice,
  useUpdatePurchaseInvoiceStatus 
} from '../../hooks/usePurchaseInvoices';
import { useProviders } from '../../hooks/useProviders';
import SEO from '../../components/common/SEO';
import type { PurchaseInvoice, Provider } from '../../types';
import { useNotificationStore } from '../../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPurchaseInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Por defecto pendientes
  const [providerId, setProviderId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: providersData } = useProviders({ is_active: true });
  
  // Parámetros de consulta para el hook
  const queryParams = useMemo(() => ({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    provider_id: providerId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort: 'due_date',
    direction: 'asc' // De la más vieja a la más reciente (vencimiento)
  }), [searchTerm, statusFilter, providerId, dateFrom, dateTo]);

  const { data: invoicesData, isLoading } = usePurchaseInvoices(queryParams);
  const deleteMutation = useDeletePurchaseInvoice();
  const updateStatusMutation = useUpdatePurchaseInvoiceStatus();

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteMutation.mutateAsync(invoiceToDelete);
      addNotification('success', 'Factura eliminada y stock revertido correctamente');
      setInvoiceToDelete(null);
    } catch (error) {
      addNotification('error', 'Error al eliminar la factura');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'paid' });
      addNotification('success', 'Factura marcada como pagada correctamente');
    } catch (error) {
      addNotification('error', 'Error al actualizar el estado de la factura');
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return 'bg-emerald-500/10 text-emerald-500';
    const days = getDaysRemaining(dueDate);
    if (days < 0) return 'bg-red-500/10 text-red-500';
    if (days <= 5) return 'bg-amber-500/10 text-amber-500';
    return 'bg-blue-500/10 text-blue-500';
  };

  const getStatusLabel = (status: string, dueDate: string) => {
    if (status === 'paid') return 'Pagada';
    const days = getDaysRemaining(dueDate);
    if (days < 0) return 'Vencida';
    if (days === 0) return 'Vence hoy';
    return `Pendiente`;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4 md:px-8">
      <SEO title="Control de Facturas de Compras | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            Control de Compras
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Gestión de Cuentas por Pagar y Vencimientos
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/compras/nueva')}
          className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Registrar Compra
        </button>
      </div>

      {/* BARRA DE FILTROS AVANZADA */}
      <section className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[32px] p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="lg:col-span-1">
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Buscar Factura</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" placeholder="No. Factura..." 
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-10 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Proveedor</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold dark:text-white appearance-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
              >
                <option value="">Todos los Proveedores</option>
                {providersData?.data?.map((p: Provider) => (
                  <option key={p.id} value={p.id}>{p.commercial_name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Estado</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold dark:text-white appearance-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
              >
                <option value="all">Ver Todas</option>
                <option value="pending">Solo Pendientes</option>
                <option value="paid">Pagadas</option>
                <option value="overdue">Vencidas</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-10 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-10 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

        </div>
      </section>

      {/* TABLA DE FACTURAS */}
      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando Documentos...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-[2px] font-black bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-6">Factura / Emisión</th>
                  <th className="px-8 py-6">Proveedor</th>
                  <th className="px-8 py-6">Condición</th>
                  <th className="px-8 py-6">Vencimiento</th>
                  <th className="px-8 py-6 text-right">Monto Total</th>
                  <th className="px-8 py-6 text-center">Estado</th>
                  <th className="px-8 py-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {invoicesData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <FileText className="w-12 h-12 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400 uppercase italic">No se encontraron facturas con los filtros aplicados</p>
                      </div>
                    </td>
                  </tr>
                ) : invoicesData?.data?.map((invoice: PurchaseInvoice) => {
                  const days = getDaysRemaining(invoice.due_date);
                  
                  return (
                    <tr key={invoice.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 dark:text-white text-sm">#{invoice.invoice_number}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                            {new Date(invoice.invoice_date).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className="font-black text-slate-700 dark:text-gray-200 text-xs uppercase tracking-tighter">{invoice.provider?.commercial_name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">RNC: {invoice.provider?.rnc}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                          {invoice.payment_terms_days === 0 ? 'Contado' : `${invoice.payment_terms_days} Días`}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                               <Clock className={`w-3 h-3 ${days < 0 ? 'text-red-500' : days <= 5 ? 'text-amber-500' : 'text-slate-400'}`} />
                               <span className={`text-xs font-black ${days < 0 ? 'text-red-500' : days <= 5 ? 'text-amber-500' : 'text-slate-700 dark:text-gray-300'}`}>
                                 {new Date(invoice.due_date).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                               </span>
                            </div>
                            {invoice.status !== 'paid' && (
                              <span className={`text-[9px] font-black uppercase mt-1 ${days < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                ({days < 0 ? `${Math.abs(days)} días vencidos` : days === 0 ? 'Vence hoy' : `${days} días faltantes`})
                              </span>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-slate-800 dark:text-white">
                          RD$ {Number(invoice.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-transparent ${getStatusColor(invoice.status, invoice.due_date)}`}>
                          {getStatusLabel(invoice.status, invoice.due_date)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {invoice.status !== 'paid' && (
                            <button 
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                              title="Marcar como Pagada"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => navigate(`/admin/compras/${invoice.id}`)}
                            className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-primary rounded-xl transition-all"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/compras/editar/${invoice.id}`)}
                            className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500 rounded-xl transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setInvoiceToDelete(invoice.id)}
                            className="p-2.5 bg-red-500/5 text-red-500/40 hover:text-red-500 rounded-xl transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      <AnimatePresence>
        {invoiceToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInvoiceToDelete(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0B0F1A] w-full max-w-sm rounded-[32px] p-8 relative z-10 border border-slate-200 dark:border-white/10 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">¿Eliminar Factura?</h3>
                <p className="text-xs font-bold text-slate-400 mt-3 leading-relaxed">
                  Esta acción revertirá el stock de los productos ingresados y eliminará el registro contable permanentemente.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  <button onClick={() => setInvoiceToDelete(null)} className="px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl font-black text-[10px] uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Cancelar</button>
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

export default AdminPurchaseInvoices;
