import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  Loader2,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useProviders, useDeleteProvider, useUpdateProvider } from '../../hooks/useProviders';
import SEO from '../../components/common/SEO';
import { useNotificationStore } from '../../store/useNotificationStore';
import ProviderFormModal from '../../components/admin/ProviderFormModal';
import type { Provider } from '../../types';

const AdminProviders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  
  const { data: providersData, isLoading } = useProviders({ search: searchTerm });
  const deleteMutation = useDeleteProvider();
  const updateMutation = useUpdateProvider();
  const addNotification = useNotificationStore(state => state.addNotification);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addNotification('success', 'Proveedor eliminado correctamente');
      } catch (error) {
        addNotification('error', 'Error al eliminar el proveedor');
      }
    }
  };

  const handleToggleStatus = async (provider: Provider) => {
    try {
      await updateMutation.mutateAsync({ 
        id: provider.id, 
        data: { is_active: !provider.is_active } 
      });
      addNotification('success', `Proveedor ${!provider.is_active ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      addNotification('error', 'Error al actualizar el estado');
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <SEO title="Proveedores | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Proveedores</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Gestión de proveedores y contactos comerciales</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => {
              setEditingProvider(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, RNC o email..." 
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
          {isLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">RNC / Email</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {providersData?.data?.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay proveedores registrados.</td></tr>
                )}
                {providersData?.data?.map((provider: Provider) => (
                  <tr key={provider.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 font-bold">
                          {provider.commercial_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{provider.commercial_name}</p>
                          <p className="text-[10px] text-slate-400">{provider.company_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600 dark:text-gray-400">RNC: {provider.rnc}</p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Mail className="w-3 h-3" /> {provider.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                          <User className="w-3 h-3" /> {provider.contact_person}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3" /> {provider.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(provider)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                          provider.is_active 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' 
                            : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                        }`}
                      >
                        {provider.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(provider)}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(provider.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
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

      <ProviderFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        provider={editingProvider}
      />
    </div>
  );
};

export default AdminProviders;
