import React, { useState } from 'react';
import { Search, Plus, Loader2, Edit, Trash2, Download } from 'lucide-react';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '../../hooks/useWarehouses';
import SEO from '../../components/common/SEO';
import { useNotificationStore } from '../../store/useNotificationStore';
import WarehouseFormModal from '../../components/admin/WarehouseFormModal';
import type { Warehouse } from '../../types';

const AdminWarehouses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const addNotification = useNotificationStore(state => state.addNotification);

  const { data: warehouseData, isLoading } = useWarehouses({ search: searchTerm });
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const handleOpenNew = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    if (!window.confirm(`Eliminar almacén ${warehouse.name}?`)) return;
    try {
      await deleteWarehouse.mutateAsync(warehouse.id);
      addNotification('success', 'Almacén eliminado correctamente');
    } catch (error) {
      addNotification('error', 'No se pudo eliminar el almacén');
    }
  };

  const handleSubmit = async (data: Partial<Warehouse>) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse.mutateAsync({ id: editingWarehouse.id, data });
        addNotification('success', 'Almacén actualizado correctamente');
      } else {
        await createWarehouse.mutateAsync(data);
        addNotification('success', 'Almacén creado correctamente');
      }
      setIsModalOpen(false);
    } catch (error) {
      addNotification('error', 'Error al guardar el almacén');
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Almacenes | Admin" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Almacenes</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Gestiona los puntos de almacenamiento y su disponibilidad</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button onClick={handleOpenNew} className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20">
            <Plus className="w-4 h-4" /> Nuevo Almacén
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar almacén, código o responsable..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
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
                <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Encargado</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {warehouseData?.data?.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No hay almacenes registrados.</td></tr>
                )}
                {warehouseData?.data?.map((warehouse: Warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{warehouse.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{warehouse.code}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{warehouse.manager || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{warehouse.address || 'Sin dirección'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${warehouse.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'}`}>
                        {warehouse.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(warehouse)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(warehouse)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
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

      <WarehouseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouse={editingWarehouse}
        onSubmit={handleSubmit}
        isLoading={createWarehouse.isLoading || updateWarehouse.isLoading}
      />
    </div>
  );
};

export default AdminWarehouses;
