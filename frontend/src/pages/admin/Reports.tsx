import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Download,
  Loader2
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useReportsDashboardStats, useReportsTopProducts, useReportsRevenue } from '../../hooks/useReports';

const AdminReports: React.FC = () => {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useReportsDashboardStats();
  const { data: topProducts, isLoading: isLoadingTop } = useReportsTopProducts();
  const { data: revenueData, isLoading: isLoadingRevenue } = useReportsRevenue('month');

  const stats = [
    { 
      label: 'Ingresos Totales', 
      value: `RD$ ${dashboardData?.revenue.total.toLocaleString() || 0}`, 
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Clientes Nuevos', 
      value: dashboardData?.customers.new_this_month.toString() || '0', 
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Pedidos Totales', 
      value: dashboardData?.orders.total.toString() || '0', 
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    { 
      label: 'Stock Crítico', 
      value: dashboardData?.products.low_stock.toString() || '0', 
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ];

  if (isLoadingDashboard || isLoadingTop || isLoadingRevenue) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEO title="Reportes | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reportes y Analíticas</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Rendimiento y estadísticas de la tienda</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-[#0B0F1A] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} dark:bg-white/5`}>
                {stat.icon}
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-8">Evolución de Ventas</h3>
          <div className="h-64 flex items-end gap-2">
            {revenueData?.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-t-lg relative flex items-end h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (item.total / (Math.max(...revenueData.map((d: any) => d.total)) || 1)) * 100)}%` }}
                    className="w-full bg-brand-primary rounded-t-lg"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.month?.substring(0, 3) || item.date}</span>
              </div>
            )) || <p className="w-full text-center text-slate-400 py-20">Sin datos disponibles</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5">
            <h3 className="font-bold text-slate-800 dark:text-white">Productos Más Vendidos</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {topProducts?.length === 0 && <p className="p-12 text-center text-slate-400">No hay ventas registradas.</p>}
            {topProducts?.map((item: any, i: number) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">{i + 1}</span>
                  <div>
                    <p className="font-bold text-sm text-slate-700 dark:text-white">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{item.total_sold} Ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-brand-primary">RD$ {parseFloat(item.total_revenue).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
