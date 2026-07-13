import api from './axios';

const ShipmentService = {
  getAll: (params?: any) =>
    api.get('/admin/shipments', { params }),

  getStats: () =>
    api.get('/admin/shipments/stats'),

  create: (data: any) =>
    api.post('/admin/shipments', data),

  update: (id: number | string, data: any) =>
    api.patch(`/admin/shipments/${id}`, data),
};

export default ShipmentService;
