import axiosInstance from './axios';

const InventoryDocumentService = {
  getDocuments: async (params?: any) => {
    const response = await axiosInstance.get('/admin/inventory-documents', { params });
    return response.data;
  },

  getDocumentById: async (id: number) => {
    const response = await axiosInstance.get(`/admin/inventory-documents/${id}`);
    return response.data;
  },
};

export default InventoryDocumentService;
