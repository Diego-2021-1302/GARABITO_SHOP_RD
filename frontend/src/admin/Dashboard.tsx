import React, { useEffect, useState } from 'react';
import { DashboardService } from '../api';

interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    month: number;
  };
  orders: {
    total: number;
    today: number;
    month: number;
  };
  products: {
    total: number;
    low_stock: number;
  };
  customers: {
    total: number;
    new_this_month: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getStats();
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats) {
    return <div>No hay datos disponibles</div>;
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
  }> = ({ title, value, subtitle, icon }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-500 mt-2">Resumen de tu tienda</p>
        </div>

        {/* Revenue Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ingresos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Ingresos Totales"
              value={`RD$ ${stats.revenue.total.toLocaleString('es-DO', {
                minimumFractionDigits: 2,
              })}`}
              icon="💰"
            />
            <StatCard
              title="Ingresos de Hoy"
              value={`RD$ ${stats.revenue.today.toLocaleString('es-DO', {
                minimumFractionDigits: 2,
              })}`}
              icon="📅"
            />
            <StatCard
              title="Ingresos del Mes"
              value={`RD$ ${stats.revenue.month.toLocaleString('es-DO', {
                minimumFractionDigits: 2,
              })}`}
              icon="📊"
            />
          </div>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Órdenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Órdenes Totales"
              value={stats.orders.total}
              icon="📦"
            />
            <StatCard
              title="Órdenes de Hoy"
              value={stats.orders.today}
              icon="🆕"
            />
            <StatCard
              title="Órdenes del Mes"
              value={stats.orders.month}
              icon="📈"
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Total de Productos"
              value={stats.products.total}
              icon="🏷️"
            />
            <StatCard
              title="Productos con Stock Bajo"
              value={stats.products.low_stock}
              subtitle="(menos de 10 unidades)"
              icon="⚠️"
            />
          </div>
        </div>

        {/* Customers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Clientes Totales"
              value={stats.customers.total}
              icon="👥"
            />
            <StatCard
              title="Nuevos Clientes este Mes"
              value={stats.customers.new_this_month}
              icon="🎉"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/products"
            className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-bold text-gray-900">Productos</h3>
            <p className="text-sm text-gray-500 mt-1">Gestionar productos</p>
          </a>

          <a
            href="/admin/orders"
            className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">🛒</div>
            <h3 className="font-bold text-gray-900">Órdenes</h3>
            <p className="text-sm text-gray-500 mt-1">Ver todas las órdenes</p>
          </a>

          <a
            href="/admin/categories"
            className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📂</div>
            <h3 className="font-bold text-gray-900">Categorías</h3>
            <p className="text-sm text-gray-500 mt-1">Gestionar categorías</p>
          </a>

          <a
            href="/admin/coupons"
            className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">🎟️</div>
            <h3 className="font-bold text-gray-900">Cupones</h3>
            <p className="text-sm text-gray-500 mt-1">Crear cupones</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
