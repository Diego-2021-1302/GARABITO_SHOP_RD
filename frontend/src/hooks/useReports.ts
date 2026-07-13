import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useReportsRevenue = (period: 'day' | 'month' = 'month') => {
  return useQuery({
    queryKey: ['admin', 'reports', 'revenue', period],
    queryFn: async () => {
      const { data } = await api.get('/admin/reports/revenue', { params: { period } });
      return data;
    },
  });
};

export const useReportsTopProducts = () => {
  return useQuery({
    queryKey: ['admin', 'reports', 'top-products'],
    queryFn: async () => {
      const { data } = await api.get('/admin/reports/top-products');
      return data;
    },
  });
};

export const useReportsDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard-stats');
      return data;
    },
  });
};
