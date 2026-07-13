import api from './axios';

const InvoiceService = {
  getAll: (params?: any) =>
    api.get('/admin/invoices', { params }),

  getStats: () =>
    api.get('/admin/invoices/stats'),

  sendEmail: (id: number) =>
    api.post(`/admin/invoices/${id}/send-email`),

  sendWhatsApp: (id: number) =>
    api.post(`/admin/invoices/${id}/send-whatsapp`),
    
  downloadPdf: (id: number) =>
    api.get(`/admin/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export default InvoiceService;
