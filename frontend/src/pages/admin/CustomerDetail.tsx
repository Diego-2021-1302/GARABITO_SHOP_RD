import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Clock, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCustomerDetail } from '../../hooks/useCustomers';
import SEO from '../../components/common/SEO';

const statusStyles: Record<string, string> = {
  'pendiente_pago': 'bg-amber-50 text-amber-600 border-amber-100',
  'comprobante_enviado': 'bg-blue-50 text-blue-600 border-blue-100',
  'pago_confirmado': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'preparando': 'bg-purple-50 text-purple-600 border-purple-100',
  'listo_envio': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'en_camino': 'bg-sky-50 text-sky-600 border-sky-100',
  'entregado': 'bg-green-50 text-green-600 border-green-100',
  'cancelado': 'bg-red-50 text-red-600 border-red-100',
};

const statusLabels: Record<string, string> = {
  'pendiente_pago': 'Pendiente de Pago',
  'comprobante_enviado': 'Comprobante Enviado',
  'pago_confirmado': 'Pago Confirmado',
  'preparando': 'Preparando',
  'listo_envio': 'Listo para Envío',
  'en_camino': 'En Camino',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado',
};

const AdminCustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomerDetail(id);

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
    </div>
  );

  if (error || !customer) return (
    <div className="p-10 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Cliente no encontrado</h2>
      <button onClick={() => navigate('/admin/clientes')} className="mt-4 text-brand-primary font-bold">Volver a la lista</button>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <SEO title={`Cliente: ${customer.name} | Admin`} />

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/clientes')}
          className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-gray-400 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Perfil del Cliente</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">ID: #{customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-black text-brand-primary uppercase">{customer.name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{customer.name}</h2>
            <p className="text-sm text-slate-500 mb-6">Cliente desde {new Date(customer.created_at).toLocaleDateString()}</p>
            
            <div className="space-y-3 text-left border-t border-slate-100 dark:border-white/5 pt-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-gray-300">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-gray-300">{customer.phone || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Estadísticas de Compra</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Pedidos</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">{customer.orders?.length || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gasto Total</p>
                <p className="text-xl font-black text-brand-primary">RD$ {Number(customer.total_spent || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Pedidos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-slate-800 dark:text-white">Historial Completo de Pedidos</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4">No. Pedido</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {customer.orders?.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Este cliente aún no ha realizado pedidos.</td></tr>
                  ) : (
                    customer.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                        <td className="px-6 py-4 font-mono font-bold">#{order.order_number}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold">RD$ {Number(order.total).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${statusStyles[order.status] || 'bg-slate-100'}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                            className="p-2 text-slate-400 hover:text-brand-primary transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
