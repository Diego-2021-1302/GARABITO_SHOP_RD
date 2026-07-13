import React, { useState } from 'react';
import { Search, Loader2, Eye, FileText, Download } from 'lucide-react';
import { useInventoryDocuments } from '../../hooks/useInventoryDocuments';
import SEO from '../../components/common/SEO';
import { useNavigate } from 'react-router-dom';
import type { InventoryDocument } from '../../types';

const AdminInventoryDocuments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState('all');
  const navigate = useNavigate();
  const { data, isLoading } = useInventoryDocuments({ search: searchTerm, document_type: documentType === 'all' ? undefined : documentType });

  return (
    <div className="space-y-6">
      <SEO title="Documentos de Inventario | Admin" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Documentos de Inventario</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Trazabilidad de entradas, salidas y ajustes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar documento, referencia o producto..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-sm outline-none dark:text-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="purchase_invoice">Factura de Entrada</option>
            <option value="sales_order">Pedido de Salida</option>
            <option value="adjustment">Ajuste</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Almacén</th>
                  <th className="px-6 py-4">Proveedor/Cliente</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data?.data?.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No se encontraron documentos.</td></tr>
                )}
                {data?.data?.map((doc: InventoryDocument) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{doc.document_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{doc.document_type || 'Sin tipo'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{doc.warehouse?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{doc.provider?.commercial_name || doc.order?.user?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{doc.status || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/admin/inventario/documentos/${doc.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
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

export default AdminInventoryDocuments;
