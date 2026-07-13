import api from './axios';

const InventoryService = {
  getAll: (params?: any) =>
    api.get('/admin/inventory', { params }),

  getStats: () =>
    api.get('/admin/inventory/stats'),

  createMovement: (data: { product_id: number | string; quantity: number; type: 'entry' | 'exit' | 'adjustment'; reason?: string }) =>
    api.post('/admin/inventory', data),

  getDocuments: (params?: any) =>
    api.get('/admin/inventory-documents', { params }),

  getDocumentById: (id: number) =>
    api.get(`/admin/inventory-documents/${id}`),

  getKardex: (params: any) =>
    api.get('/admin/inventory-movements/kardex', { params }),
};

export default InventoryService;
