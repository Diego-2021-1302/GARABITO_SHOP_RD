import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InventoryService from '../api/InventoryService';

export const useInventoryDocuments = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'inventory-documents', params],
    queryFn: async () => {
      const { data } = await InventoryService.getDocuments(params);
      return data;
    },
  });
};

export const useInventoryDocument = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'inventory-document', id],
    queryFn: async () => {
      const { data } = await InventoryService.getDocumentById(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useKardex = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'inventory-movements', 'kardex', params],
    queryFn: async () => {
      const { data } = await InventoryService.getKardex(params);
      return data;
    },
    enabled: !!params?.product_id,
  });
};
