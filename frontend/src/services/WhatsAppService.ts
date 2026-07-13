const DEFAULT_STORE_PHONE = '18492534567'; // Backup number

/**
 * WhatsAppService
 * Note: Since this is a service outside of React context, 
 * we provide a way to pass the phone number or it uses the default.
 */
export const WhatsAppService = {
  /**
   * Cleans the phone number to be used in wa.me links
   * Handles adding country code for DR if missing
   */
  formatPhone: (phone?: string) => {
    if (!phone) return DEFAULT_STORE_PHONE;
    
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it's a 10 digit number (like 809, 829, 849), add the country code 1 for NANP
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return cleaned;
  },

  /**
   * Genera un enlace de WhatsApp para consultar sobre un producto específico
   */
  getProductInquiryUrl: (productName: string, productUrl: string, storePhone?: string) => {
    const phone = WhatsAppService.formatPhone(storePhone);
    const message = `¡Hola! Me interesa este producto: *${productName}*.\n\nLink: ${productUrl}\n\n¿Tienen disponibilidad?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Genera un enlace de WhatsApp con el resumen del carrito (Pre-pedido)
   */
  getCartSummaryUrl: (items: any[], total: number, storePhone?: string) => {
    const phone = WhatsAppService.formatPhone(storePhone);
    let message = `*¡Hola Garabito Shop RD!* 👋\n\nQuiero realizar un pedido por transferencia:\n\n`;
    
    items.forEach((item) => {
      message += `• ${item.name} (x${item.quantity}) - RD$ ${Math.round(item.discount_price || item.price).toLocaleString()}\n`;
    });

    message += `\n*Total a transferir: RD$ ${Math.round(total).toLocaleString()}*\n\n¿Me podrían facilitar los datos bancarios para completar mi compra?`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Genera mensaje de confirmación de pedido ya realizado
   */
  getOrderConfirmationUrl: (orderNumber: string, total: number, customerName: string, storePhone?: string) => {
    const phone = WhatsAppService.formatPhone(storePhone);
    const message = `*Confirmación de Pago - Pedido #${orderNumber}* 🧾\n\nHola Garabito Shop, mi nombre es *${customerName}*.\n\nHe realizado mi pedido por un total de *RD$ ${Math.round(total).toLocaleString()}*.\n\nAdjunto aquí el comprobante de transferencia para proceder con el envío.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Enlace directo a soporte
   */
  getSupportUrl: (storePhone?: string) => {
    const phone = WhatsAppService.formatPhone(storePhone);
    const message = `¡Hola! Necesito ayuda con mi compra en Garabito Shop.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
};
