import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Download,
  Loader2,
  Eye
} from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import SEO from '../../components/common/SEO';

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: customersData, isLoading } = useCustomers({ search: searchTerm });

  return (
    <div className="space-y-6">
      <SEO title="Clientes | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Directorio de Clientes</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Consulta el perfil y comportamiento de compra de tus usuarios</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Exportar Lista
        </button>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nombre, correo o teléfono..." 
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
                <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4 text-center">No. Pedidos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {customersData?.data?.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black uppercase">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{customer.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <p className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                          <Phone className="w-3 h-3" /> {customer.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-brand-primary">
                      {customer.orders_count || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/clientes/${customer.id}`)}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-brand-primary rounded-xl transition-all" 
                        title="Ver Historial Completo"
                      >
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

export default AdminCustomers;
