import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InvoiceService from '../api/InvoiceService';
import { useNotificationStore } from '../store/useNotificationStore';

export const useInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'invoices', params],
    queryFn: async () => {
      const { data } = await InvoiceService.getAll(params);
      return data;
    },
  });
};

export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['admin', 'invoice-stats'],
    queryFn: async () => {
      const { data } = await InvoiceService.getStats();
      return data;
    },
  });
};

export const useSendInvoiceEmail = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  return useMutation({
    mutationFn: (id: number) => InvoiceService.sendEmail(id),
    onSuccess: () => {
      addNotification('success', 'Factura enviada por correo correctamente.');
    },
    onError: (error: any) => {
      addNotification('error', error.response?.data?.message || 'Error al enviar la factura por correo.');
    }
  });
};

export const useSendInvoiceWhatsApp = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (id: number) => InvoiceService.sendWhatsApp(id),
    onSuccess: () => {
      addNotification('success', 'Factura enviada por WhatsApp correctamente.');
    },
    onError: (error: any) => {
      addNotification('error', error.response?.data?.message || 'Error al enviar la factura por WhatsApp.');
    }
  });
};

export const useDownloadInvoicePdf = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number, filename: string }) => {
      const response = await InvoiceService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onSuccess: () => {
      addNotification('success', 'Factura descargada correctamente.');
    },
    onError: () => {
      addNotification('error', 'Error al descargar la factura.');
    }
  });
};
