import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, Calendar, Building2, Warehouse, ClipboardList } from 'lucide-react';
import { useInventoryDocument } from '../../hooks/useInventoryDocuments';
import SEO from '../../components/common/SEO';
import { useNotificationStore } from '../../store/useNotificationStore';

const AdminInventoryDocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addNotification = useNotificationStore(state => state.addNotification);

  const { data: document, isLoading } = useInventoryDocument(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Documento no encontrado</h2>
        <button onClick={() => navigate('/admin/inventario/documentos')} className="mt-4 text-brand-primary font-bold">Volver al listado</button>
      </div>
    );
  }

  const items = document.items || (document as any).lines || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SEO title={`Documento ${document.document_number || id} | Admin`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/inventario/documentos')} className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-slate-800 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Detalle de Documento</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">Trazabilidad del documento de inventario</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <FileText className="w-4 h-4" /> {document.document_type || 'Documento'}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <Calendar className="w-4 h-4" /> {new Date(document.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-gray-400">
            <Warehouse className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-[0.2em]">Almacén</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-white font-semibold">{document.warehouse?.name || 'No asignado'}</p>
          <p className="text-sm text-slate-500 dark:text-gray-400">{document.warehouse?.code || '---'}</p>
          {document.warehouse?.address && <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">{document.warehouse.address}</p>}
        </div>

        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-gray-400">
            <Building2 className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-[0.2em]">Proveedor / Cliente</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-white font-semibold">{document.provider?.commercial_name || document.order?.user?.name || 'No disponible'}</p>
          {document.provider?.rnc && <p className="text-sm text-slate-500 dark:text-gray-400">RNC: {document.provider.rnc}</p>}
          {document.provider?.contact_person && <p className="text-sm text-slate-500 dark:text-gray-400">Contacto: {document.provider.contact_person}</p>}
        </div>

        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-gray-400">
            <ClipboardList className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-[0.2em]">Referencia</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-white font-semibold">{document.reference || '—'}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">Estado</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-white">{document.status || 'Pendiente'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Líneas del Documento</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Detalle de productos y cantidades registradas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-slate-400 dark:text-gray-500 uppercase text-[10px] tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Costo Unitario</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay líneas registradas para este documento.</td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{item.product?.name || item.product_name || 'Producto'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.product?.sku || item.sku || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.quantity}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">RD$ {item.cost_unit?.toLocaleString() ?? '0'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-white">RD$ {item.total_cost?.toLocaleString() ?? (item.quantity * (item.cost_unit || 0)).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {document.notes && (
        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-2">Notas</h3>
          <p className="text-sm text-slate-600 dark:text-gray-300">{document.notes}</p>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryDocumentDetail;
