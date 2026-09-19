import { Product, Order, DownloadToken, Customer, EmailRecord, AnalyticsEvent, CheckoutResponse } from '../types.js';

export async function fetchProducts(all = false): Promise<Product[]> {
  const res = await fetch(`/api/products${all ? '?all=true' : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products;
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`/api/products/${slug}`);
  if (!res.ok) throw new Error('Product not found');
  const data = await res.json();
  return data.product;
}

export async function initiateCheckout(productId: string, customerEmail: string, customerName?: string): Promise<CheckoutResponse> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, customerEmail, customerName })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Checkout initiation failed' }));
    throw new Error(err.error || 'Checkout failed');
  }
  return res.json();
}

export async function processPaymentWebhook(payload: {
  payment_reference: string;
  payment_provider?: string;
  product_id: string;
  customer_email: string;
  customer_name?: string;
  amount: number;
  currency?: string;
  status?: 'SUCCESS' | 'FAILED';
  signature?: string;
}) {
  const res = await fetch('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Webhook payment processing failed');
  }
  return data;
}

export async function fetchOrder(id: string): Promise<{ order: Order; downloads: DownloadToken[] }> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export async function lookupOrders(query: string): Promise<(Order & { downloads: DownloadToken[] })[]> {
  const res = await fetch('/api/orders/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Order lookup failed');
  const data = await res.json();
  return data.orders;
}

export async function trackAnalytics(event_name: AnalyticsEvent['event_name'], product_id?: string, metadata?: Record<string, unknown>) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name, product_id, metadata })
    });
  } catch (e) {
    // Fail silently for analytics
    console.debug('Analytics track error:', e);
  }
}

// Admin API
export async function fetchAdminMetrics() {
  const res = await fetch('/api/admin/metrics');
  if (!res.ok) throw new Error('Failed to fetch admin metrics');
  return res.json();
}

export async function fetchAdminOrders(status?: string) {
  const url = status ? `/api/admin/orders?status=${status}` : '/api/admin/orders';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function refundOrder(orderId: string) {
  const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: 'POST' });
  if (!res.ok) throw new Error('Refund failed');
  return res.json();
}

export async function resendOrderEmail(orderId: string) {
  const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, { method: 'POST' });
  if (!res.ok) throw new Error('Resend email failed');
  return res.json();
}

export async function fetchAdminCustomers(): Promise<Customer[]> {
  const res = await fetch('/api/admin/customers');
  if (!res.ok) throw new Error('Failed to fetch customers');
  const data = await res.json();
  return data.customers;
}

export async function fetchAdminDownloads(): Promise<DownloadToken[]> {
  const res = await fetch('/api/admin/downloads');
  if (!res.ok) throw new Error('Failed to fetch downloads');
  const data = await res.json();
  return data.downloads;
}

export async function revokeDownloadToken(token: string) {
  const res = await fetch(`/api/admin/downloads/${token}/revoke`, { method: 'POST' });
  if (!res.ok) throw new Error('Revoke failed');
  return res.json();
}

export async function fetchAdminEmails(): Promise<EmailRecord[]> {
  const res = await fetch('/api/admin/emails');
  if (!res.ok) throw new Error('Failed to fetch emails');
  const data = await res.json();
  return data.emails;
}

export async function updateAdminProduct(id: string, updates: Partial<Product>) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}
