/**
 * Estandarización de tipos de Producto para el Frontend
 */

export type ProductVariant = {
  id: string | number;
  name: string;
  type: 'color' | 'size' | 'material' | 'storage';
  value: string;
  stock: number;
  price_override?: number;
}

export type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  warranty?: string;
  sku: string;
  slug?: string;
  status: 'active' | 'inactive';
}
