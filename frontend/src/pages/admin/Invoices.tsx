import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Eye, 
  Loader2,
  Calendar,
  Mail,
  MessageSquare
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { 
  useInvoices, 
  useInvoiceStats, 
  useSendInvoiceEmail, 
  useSendInvoiceWhatsApp,
  useDownloadInvoicePdf 
} from '../../hooks/useInvoices';

const AdminInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: invoicesData, isLoading } = useInvoices({ search: searchTerm });
  const { data: stats } = useInvoiceStats();

  const sendEmail = useSendInvoiceEmail();
  const sendWhatsApp = useSendInvoiceWhatsApp();
  const downloadPdf = useDownloadInvoicePdf();

  const handleDownload = (id: number) => {
    downloadPdf.mutate({ id, filename: `Factura_${id}.pdf` });
  };

  return (
    <div className="space-y-6">
      <SEO title="Facturación | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Registro de Ventas</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Historial de facturas emitidas por pedidos pagados</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-primary p-6 rounded-2xl text-white shadow-lg shadow-brand-primary/20">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Total Facturado (Mes)</p>
          <h3 className="text-3xl font-bold">RD$ {stats?.total_invoiced_month?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white dark:bg-[#0B0F1A] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facturas Emitidas</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{invoicesData?.data?.length || 0}</h3>
        </div>
        <div className="bg-white dark:bg-[#0B0F1A] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pendientes de Generar</p>
          <h3 className="text-3xl font-bold text-amber-500">{stats?.pending_count || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-2 uppercase font-black">Esperando confirmación de pago</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por número de factura o cliente..." 
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-wider font-black bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-5">No. Factura</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5">Fecha Emisión</th>
                  <th className="px-6 py-5">Monto Total</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {invoicesData?.data?.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">No se han emitido facturas aún.</td></tr>
                )}
                {invoicesData?.data?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200/50 dark:border-white/5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">FAC-{order.id.toString().padStart(4, '0')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 dark:text-white text-xs uppercase">{order.user?.name || 'Cliente Final'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Venta Online</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-400 font-bold text-xs">
                      {new Date(order.paid_at || order.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-white text-xs">
                      RD$ {Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleDownload(order.id)}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" 
                          title="Descargar Factura"
                        >
                          {downloadPdf.isPending && downloadPdf.variables?.id === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </button>
                        
                        <button 
                          onClick={() => sendEmail.mutate(order.id)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" 
                          title="Enviar Correo"
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => sendWhatsApp.mutate(order.id)}
                          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" 
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

                        <button
                          onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInvoices;
