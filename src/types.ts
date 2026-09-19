export type ProductType = 'SINGLE' | 'BUNDLE';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface ProductPreviewPage {
  pageNumber: number;
  title: string;
  subtitle: string;
  excerpt: string;
  highlightPoints: string[];
}

export interface Product {
  id: string; // e.g. 'EGG-001'
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  short_description: string;
  price: number; // in USD
  currency: string;
  type: ProductType;
  status: ProductStatus;
  cover_image: string;
  file_reference: string; // private file reference
  page_count: number;
  benefits: string[];
  whats_included: string[];
  table_of_contents: string[];
  preview_pages: ProductPreviewPage[];
  faq: { question: string; answer: string }[];
  bundle_product_ids?: string[]; // If BUNDLE, contains product IDs like ['EGG-001', 'SUG-001', 'FIB-001']
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name?: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  payment_provider: string;
  payment_reference: string;
  payment_status: PaymentStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface DownloadToken {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  token: string;
  expires_at: string;
  download_count: number;
  max_downloads: number;
  is_revoked: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  purchases_count: number;
  total_spent: number;
  created_at: string;
  last_order_at: string;
}

export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  type: 'PURCHASE_CONFIRMATION' | 'DELIVERY' | 'RESENT_DELIVERY';
  sent_at: string;
  order_id: string;
  order_number: string;
  product_names: string[];
  download_urls: { product_name: string; url: string; token: string }[];
  status: 'SENT' | 'FAILED';
  content_html?: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: 'page_view' | 'product_view' | 'buy_click' | 'checkout_started' | 'payment_success' | 'download_started';
  product_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface CheckoutRequest {
  productId: string;
  customerEmail: string;
  customerName?: string;
}

export interface CheckoutResponse {
  checkoutId: string;
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    type: ProductType;
  };
  totalAmount: number;
  currency: string;
}

export interface WebhookPayload {
  payment_reference: string;
  payment_provider: string;
  checkout_id?: string;
  product_id: string;
  customer_email: string;
  customer_name?: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED';
  signature?: string;
}
