// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'vendor' | 'driver' | 'staff';
  is_active: boolean;
  email_verified_at?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  discountPrice?: number;
  cost?: number;
  category_id: number;
  categoryId?: number;
  brand?: string;
  brand_id?: number;
  brandId?: number;
  stock_quantity: number;
  sku: string;
  barcode?: string;
  internal_code?: string;
  internalCode?: string;
  unit_of_measurement?: string;
  unitOfMeasurement?: string;
  weight?: number;
  location?: string;
  minimum_stock?: number;
  minimumStock?: number;
  maximum_stock?: number;
  maximumStock?: number;
  warranty?: string;
  is_active: boolean;
  isActive?: boolean;
  featured: boolean;
  isFeatured?: boolean;
  is_new?: boolean;
  isNew?: boolean;
  status?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  category?: Category;
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price_adjustment: number;
  stock_quantity: number;
  color?: string;
  size?: string;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active: boolean;
  children?: Category[];
  products?: Product[];
  created_at: string;
  updated_at: string;
}

// Address types (RD specific)
export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  provincia: string;
  municipio: string;
  sector: string;
  referencia: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Order types
export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: 'pending' | 'in_review' | 'on_delivery' | 'received' | 'preparing' | 'ready' | 'awaiting_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  itbis: number;
  shipping_cost: number;
  total: number;
  payment_method: 'azul' | 'cardnet' | 'visanet' | 'transfer' | 'cod';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  shipping_address_id?: number;
  billing_address_id?: number;
  coupon_id?: number;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  items?: OrderItem[];
  shipment?: Shipment;
  payment_transaction?: PaymentTransaction;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
  variant?: ProductVariant;
  created_at: string;
  updated_at: string;
}

// Shipment types
export interface Shipment {
  id: number;
  order_id: number;
  tracking_number?: string;
  carrier?: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  shipped_date?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Payment transaction types
export interface PaymentTransaction {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  reference_number?: string;
  response_data?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Review types
export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  order_item_id?: number;
  rating: number;
  title: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  unhelpful_count: number;
  user?: User;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  manager?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryDocumentItem {
  id: number;
  inventory_document_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  cost_unit?: number;
  total_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryDocument {
  id: number;
  document_number?: string;
  document_type?: string;
  reference?: string;
  status?: string;
  warehouse?: Warehouse;
  provider?: Provider;
  order?: Order;
  items?: InventoryDocumentItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Coupon types
export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount?: number;
  max_uses?: number;
  max_uses_per_user: number;
  usage_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Wishlist types
export interface Wishlist {
  id: number;
  user_id: number;
  products?: Product[];
  created_at: string;
  updated_at: string;
}

// Cart types
export interface CartItem {
  product_id: number;
  variant_id?: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itbis: number;
  total: number;
}

// Provider types
export interface Provider {
  id: number;
  commercial_name: string;
  company_name: string;
  rnc: string;
  phone: string;
  email: string;
  address: string;
  contact_person: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Purchase Invoice types
export interface PurchaseInvoice {
  id: number;
  provider_id: number;
  provider?: Provider;
  warehouse_id?: number;
  warehouse?: Warehouse;
  invoice_number: string;
  invoice_date: string;
  payment_terms_days: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  details?: PurchaseInvoiceDetail[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseInvoiceDetail {
  id: number;
  purchase_invoice_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_cost: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// Purchase Payment types
export interface PurchasePayment {
  id: number;
  purchase_invoice_id: number;
  purchase_invoice?: PurchaseInvoice;
  payment_date: string;
  amount: number;
  bank_name: string;
  transaction_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Inventory types
export interface InventoryMovement {
  id: number;
  product_id: number;
  product?: Product;
  user_id: number;
  user?: User;
  quantity: number;
  type: 'entry' | 'exit' | 'adjustment';
  reason?: string;
  created_at: string;
  updated_at: string;
}
