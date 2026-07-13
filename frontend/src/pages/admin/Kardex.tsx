import React, { useEffect, useState } from 'react';
import { Search, Loader2, Download, Calendar, Warehouse as WarehouseIcon } from 'lucide-react';
import { useKardex } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import SEO from '../../components/common/SEO';
import { useWarehouses } from '../../hooks/useWarehouses';
import type { Warehouse } from '../../types';

const AdminKardex: React.FC = () => {
  const [productId, setProductId] = useState<number | string>('');
  const [warehouseId, setWarehouseId] = useState<number | string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  const productsQuery = useProducts({ search: searchProduct });
  const warehousesQuery = useWarehouses({ is_active: true });
  const { data, isLoading, refetch } = useKardex({ product_id: productId, warehouse_id: warehouseId, from_date: fromDate, to_date: toDate });

  useEffect(() => {
    if (productId) {
      refetch();
    }
  }, [productId, warehouseId, fromDate, toDate, refetch]);

  return (
    <div className="space-y-6">
      <SEO title="Kárdex | Admin" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kárdex</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Consulta detallada de movimientos por producto y almacén</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">Producto</label>
          <input
            type="text"
            placeholder="Buscar producto..."
            className="mt-2 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none dark:text-white"
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
          />
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="mt-4 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none dark:text-white"
          >
            <option value="">Seleccionar producto</option>
            {productsQuery.data?.map((product: any) => (
              <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">Almacén</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="mt-2 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none dark:text-white"
          >
            <option value="">Todos los almacenes</option>
            {warehousesQuery.data?.data?.map((warehouse: Warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-2 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-2 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Almacén</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Saldo</th>
                <th className="px-6 py-4">Costo U.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data?.ledger?.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Selecciona un producto para ver el kardex.</td></tr>
              )}
              {data?.ledger?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{new Date(item.date).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{item.document || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.document_type || item.type}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.warehouse || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.quantity}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.running_balance}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">RD$ {item.cost_unit?.toLocaleString() || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminKardex;
