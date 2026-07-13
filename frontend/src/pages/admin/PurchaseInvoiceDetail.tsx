import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Package,
  Loader2,
  Building2,
  Download
} from 'lucide-react';
import { usePurchaseInvoice, useUpdatePurchaseInvoiceStatus } from '../../hooks/usePurchaseInvoices';
import SEO from '../../components/common/SEO';
import { useNotificationStore } from '../../store/useNotificationStore';

const AdminPurchaseInvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: invoice, isLoading } = usePurchaseInvoice(Number(id));
  const updateStatusMutation = useUpdatePurchaseInvoiceStatus();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Factura no encontrada</h2>
        <button onClick={() => navigate('/admin/compras')} className="mt-4 text-brand-primary font-bold">Volver al listado</button>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid': return { label: 'Pagada', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'pending': return { label: 'Pendiente', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-500', icon: <Clock className="w-4 h-4" /> };
      case 'overdue': return { label: 'Vencida', color: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-500', icon: <AlertCircle className="w-4 h-4" /> };
      default: return { label: status, color: 'text-slate-600 bg-slate-50', icon: null };
    }
  };

  const statusInfo = getStatusInfo(invoice.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SEO title={`Factura ${invoice.invoice_number} | Admin`} />

      {/* Estilos CSS específicos para la impresión a PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 1cm; }
          body { background: white !important; color: black !important; font-size: 12pt; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .invoice-card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; background: white !important; }
          .text-brand { color: #000 !important; }
          .bg-slate-50 { background: #f8fafc !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border-bottom: 1px solid #e2e8f0 !important; padding: 8px !important; }
        }
      `}} />

      {/* Acciones (Ocultas al imprimir) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/compras')} className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-slate-800 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Detalle de Factura</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${statusInfo.color}`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Printer className="w-5 h-5" />
            Imprimir Factura (PDF)
          </button>
        </div>
      </div>

      <div className="invoice-card bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        {/* Cabecera Formal (Visible al imprimir y en pantalla) */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Garabito Shop RD</h2>
              <div className="text-sm text-slate-500 space-y-1">
                <p>RNC: 132-45678-9</p>
                <p>Av. Principal #123, Santo Domingo, RD</p>
                <p>Tel: (809) 555-0123 | info@garabitoshop.com</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg mb-2">
                <p className="text-xs font-bold uppercase tracking-widest">Factura de Entrada</p>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">#{invoice.invoice_number}</p>
              <p className="text-sm text-slate-500">Fecha: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Info Proveedor y Condiciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-transparent">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Datos del Proveedor
            </h3>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 dark:text-white text-lg">{invoice.provider?.commercial_name}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">RNC: {invoice.provider?.rnc}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Contacto: {invoice.provider?.contact_person}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">{invoice.provider?.email}</p>
              {invoice.warehouse && (
                <p className="text-sm text-slate-600 dark:text-gray-400">Almacén: {invoice.warehouse.name} ({invoice.warehouse.code})</p>
              )}
            </div>
          </div>
          <div className="space-y-4 md:text-right">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center md:justify-end gap-2">
              <Calendar className="w-4 h-4" /> Condiciones de Pago
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-gray-400">Términos: <span className="font-bold text-slate-800 dark:text-white">{invoice.payment_terms_days === 0 ? 'Contado' : `${invoice.payment_terms_days} días`}</span></p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Vencimiento: <span className="font-bold text-red-500">{new Date(invoice.due_date).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-white/5 bg-slate-50/50">
                <th className="px-8 py-4">Descripción del Producto</th>
                <th className="px-8 py-4 text-center">Cant.</th>
                <th className="px-8 py-4 text-right">Costo U.</th>
                <th className="px-8 py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {invoice.details?.map((detail: any) => (
                <tr key={detail.id} className="text-sm">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800 dark:text-white">{detail.product?.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {detail.product?.sku}</p>
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-slate-700 dark:text-gray-200">{detail.quantity}</td>
                  <td className="px-8 py-5 text-right text-slate-600 dark:text-gray-400">RD$ {Number(detail.unit_cost).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-bold text-slate-800 dark:text-white">RD$ {Number(detail.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="p-8 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col items-end space-y-3">
            <div className="w-full md:w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal Gravado</span>
                <span className="font-bold text-slate-700 dark:text-gray-200">RD$ {Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">ITBIS (18%)</span>
                <span className="font-bold text-slate-700 dark:text-gray-200">RD$ {Number(invoice.tax_amount || 0).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-base font-black text-slate-900 dark:text-white uppercase">Total RD$</span>
                <span className="text-2xl font-black text-brand-primary text-brand">RD$ {Number(invoice.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notas (Solo si existen) */}
        {invoice.notes && (
          <div className="p-8 border-t border-slate-100 dark:border-white/5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observaciones</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 italic">"{invoice.notes}"</p>
          </div>
        )}

        {/* Firmas (Solo visible al imprimir) */}
        <div className="hidden print:flex justify-between mt-20 px-8 pb-10">
          <div className="w-64 border-t border-slate-900 pt-2 text-center">
            <p className="text-[10px] font-bold uppercase">Entregado Por (Firma y Sello)</p>
          </div>
          <div className="w-64 border-t border-slate-900 pt-2 text-center">
            <p className="text-[10px] font-bold uppercase">Recibido Almacén (Firma y Sello)</p>
          </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-slate-400 no-print italic">
        * Para guardar como PDF, seleccione "Guardar como PDF" en el destino de su impresora.
      </p>
    </div>
  );
};

export default AdminPurchaseInvoiceDetail;
