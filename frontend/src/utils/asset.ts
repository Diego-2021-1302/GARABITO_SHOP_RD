/**
 * Resuelve la URL de un asset (imagen, logo, etc.) asegurando que apunte al dominio correcto.
 * Si el asset está en 'storage', lo redirige al backend. Si es local, lo mantiene en el frontend.
 */
export const getAssetUrl = (path: any): string => {
  if (!path) return '/placeholder.png';

  // Si el path es un objeto (relaciones de Eloquent), extraemos la URL
  const finalPath = typeof path === 'object' ? (path.image_url || path.logo_url || path.url) : path;

  if (!finalPath || typeof finalPath !== 'string') return '/placeholder.png';

  // URLs completas o datos en base64/blob no se modifican
  if (finalPath.startsWith('http') || finalPath.startsWith('blob:') || finalPath.startsWith('data:')) {
    return finalPath;
  }

  // Limpieza de barras duplicadas
  let cleanPath = finalPath.replace(/\/+/g, '/');

  // Identificar si el asset pertenece al almacenamiento del backend
  const isBackendAsset = cleanPath.includes('/storage/') ||
                         cleanPath.includes('brands/') ||
                         cleanPath.includes('products/') ||
                         cleanPath.includes('bank_logos/') ||
                         cleanPath.includes('payment_proofs/') ||
                         cleanPath.includes('invoices/') ||
                         cleanPath.includes('categories/');

  if (isBackendAsset) {
    // Extraemos la URL base del backend desde la variable de entorno de la API
    const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

    let storagePath = cleanPath;

    if (cleanPath.includes('/storage/')) {
       // Si ya tiene /storage/, nos aseguramos de que empiece ahí
       storagePath = cleanPath.substring(cleanPath.indexOf('/storage/'));
    } else {
       // Si no tiene /storage/ pero es un asset de backend, lo prefijamos
       // Eliminamos barra inicial si existe para evitar duplicación
       const relativePath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
       storagePath = `/storage/${relativePath}`;
    }

    return `${backendBase}${storagePath}`;
  }

  // Assets locales del frontend (en la carpeta public)
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
};
