import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { generateProductPdf } from './src/server/pdfGenerator.js';
import { Order, OrderItem, DownloadToken, Product } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------- Public API Endpoints -----------------

// 1. Get all published products (or all if admin)
app.get('/api/products', (req: Request, res: Response) => {
  const includeUnpublished = req.query.all === 'true';
  const products = db.getAllProducts(includeUnpublished);
  res.json({ products });
});

// 2. Get product by slug
app.get('/api/products/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = db.getProductBySlug(slug);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

// 3. Checkout API (FR-004, FR-005) - NEVER trusts client-supplied price
app.post('/api/checkout', (req: Request, res: Response) => {
  const { productId, customerEmail, customerName } = req.body;

  if (!productId || !customerEmail) {
    res.status(400).json({ error: 'Product ID and customer email are required' });
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    res.status(400).json({ error: 'Invalid email address format' });
    return;
  }

  // Retrieve validated product and price from database
  const product = db.getProductById(productId);
  if (!product) {
    res.status(404).json({ error: 'Product does not exist' });
    return;
  }

  if (product.status !== 'PUBLISHED') {
    res.status(400).json({ error: 'This guide is currently unavailable for purchase' });
    return;
  }

  const checkoutId = 'chk_' + Math.random().toString(36).substring(2, 12);

  // Log analytics event
  db.logAnalytics({
    event_name: 'checkout_started',
    product_id: product.id,
    metadata: { checkoutId, email: customerEmail, amount: product.price }
  });

  res.json({
    checkoutId,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      type: product.type,
      short_description: product.short_description,
      cover_image: product.cover_image,
      bundle_product_ids: product.bundle_product_ids
    },
    totalAmount: product.price,
    currency: product.currency,
    customerEmail,
    customerName: customerName || customerEmail.split('@')[0]
  });
});

// 4. Payment Webhook Endpoint (FR-006, FR-007, FR-008, FR-009)
app.post('/api/webhooks/payment', (req: Request, res: Response) => {
  const {
    payment_reference,
    payment_provider = 'SimulatedStripe',
    product_id,
    customer_email,
    customer_name,
    amount,
    currency = 'USD',
    status = 'SUCCESS',
    signature
  } = req.body;

  if (!payment_reference || !product_id || !customer_email) {
    res.status(400).json({ error: 'Missing required webhook parameters' });
    return;
  }

  // Idempotency check (FR-007: Duplicate Payment Protection)
  if (db.processedPaymentRefs.has(payment_reference)) {
    console.log(`[Webhook] Duplicate payment reference ignored: ${payment_reference}`);
    const existingOrder = db.getOrderByPaymentRef(payment_reference);
    res.json({
      success: true,
      idempotent: true,
      message: 'Payment already processed successfully',
      orderNumber: existingOrder?.order_number,
      orderId: existingOrder?.id
    });
    return;
  }

  // Validate product and price from database
  const product = db.getProductById(product_id);
  if (!product) {
    res.status(404).json({ error: 'Product does not exist in catalog' });
    return;
  }

  if (status !== 'SUCCESS') {
    // Record failed payment attempt
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSeq = Math.floor(100000 + Math.random() * 900000);
    const failedOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      order_number: `ORD-${dateStr}-${randSeq}`,
      customer_email,
      customer_name,
      total_amount: product.price,
      currency: product.currency,
      payment_provider,
      payment_reference,
      payment_status: 'FAILED',
      items: [
        {
          id: 'ITEM-' + Math.random().toString(36).substring(2, 9),
          order_id: '',
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: 1,
          subtotal: product.price
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.createOrder(failedOrder);
    db.processedPaymentRefs.add(payment_reference);

    db.logAnalytics({
      event_name: 'payment_success', // tracked as failed in meta
      product_id: product.id,
      metadata: { status: 'FAILED', payment_reference }
    });

    res.status(400).json({ error: 'Payment processing was marked as failed' });
    return;
  }

  // Verify amount matches database price (with tolerance for floating points)
  if (amount !== undefined && Math.abs(Number(amount) - product.price) > 0.01) {
    console.warn(`[Webhook] Price mismatch warning: Provided ${amount}, Expected ${product.price}`);
  }

  // Mark reference as processed for idempotency
  db.processedPaymentRefs.add(payment_reference);

  // Generate order number (ORD-YYYYMMDD-XXXXXX)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSeq = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `ORD-${dateStr}-${randSeq}`;
  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Determine items and entitlements (FR-009 Bundle logic)
  const orderItems: OrderItem[] = [];
  const entitledProducts: Product[] = [];

  if (product.type === 'BUNDLE' && product.bundle_product_ids) {
    // Top-level bundle item
    orderItems.push({
      id: 'ITEM-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: 1,
      subtotal: product.price
    });

    // Entitle all bundle items
    for (const childId of product.bundle_product_ids) {
      const child = db.getProductById(childId);
      if (child) {
        entitledProducts.push(child);
      }
    }
  } else {
    orderItems.push({
      id: 'ITEM-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: 1,
      subtotal: product.price
    });
    entitledProducts.push(product);
  }

  const order: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_email,
    customer_name: customer_name || customer_email.split('@')[0],
    total_amount: product.price,
    currency: product.currency,
    payment_provider,
    payment_reference,
    payment_status: 'PAID',
    items: orderItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createOrder(order);

  // Generate secure download tokens for each entitled product (FR-011)
  const downloadTokens: DownloadToken[] = [];
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days expiry

  for (const entProduct of entitledProducts) {
    const rawToken = 'dl_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const download = db.createDownloadToken({
      order_id: orderId,
      product_id: entProduct.id,
      product_name: entProduct.name,
      token: rawToken,
      expires_at: expiresAt,
      max_downloads: 10,
    });
    downloadTokens.push(download);
  }

  // Trigger Purchase Confirmation and Delivery Emails (FR-012, FR-013)
  const downloadUrls = downloadTokens.map(d => ({
    product_name: d.product_name,
    token: d.token,
    url: `/api/download/${d.token}`
  }));

  // 1. Purchase Confirmation Email
  db.logEmail({
    to: customer_email,
    subject: `Order Confirmation: ${orderNumber} - ${product.name}`,
    type: 'PURCHASE_CONFIRMATION',
    order_id: orderId,
    order_number: orderNumber,
    product_names: entitledProducts.map(p => p.name),
    download_urls: downloadUrls,
    status: 'SENT',
    content_html: `
      <h2>Thank you for your purchase!</h2>
      <p>Your order <strong>${orderNumber}</strong> for <strong>${product.name}</strong> ($${product.price.toFixed(2)} ${product.currency}) was completed successfully.</p>
      <p>You can access your publications immediately using the secure download links below.</p>
    `
  });

  // 2. Product Delivery Email
  db.logEmail({
    to: customer_email,
    subject: `Your Guide is Ready: ${product.name} [Download Access]`,
    type: 'DELIVERY',
    order_id: orderId,
    order_number: orderNumber,
    product_names: entitledProducts.map(p => p.name),
    download_urls: downloadUrls,
    status: 'SENT',
    content_html: `
      <h2>Your digital guide is ready for download</h2>
      <p>Thank you for supporting Food & Body. Click the link(s) below to download your visual guide:</p>
      <ul>
        ${downloadUrls.map(u => `<li><a href="${u.url}">${u.product_name}</a> (Token: ${u.token})</li>`).join('')}
      </ul>
      <p><small>This download link is associated with order ${orderNumber}. Valid for 30 days and up to 10 downloads.</small></p>
    `
  });

  // Track analytics
  db.logAnalytics({
    event_name: 'payment_success',
    product_id: product.id,
    metadata: { orderNumber, amount: product.price, itemsCount: entitledProducts.length }
  });

  res.json({
    success: true,
    orderId,
    orderNumber,
    customerEmail: customer_email,
    product: { id: product.id, name: product.name, price: product.price },
    downloadTokens: downloadTokens.map(d => ({
      product_id: d.product_id,
      product_name: d.product_name,
      token: d.token,
      download_url: `/api/download/${d.token}`,
      expires_at: d.expires_at,
      max_downloads: d.max_downloads,
      download_count: d.download_count
    }))
  });
});

// 5. Secure Download Endpoint (FR-010, FR-011, Section 20)
app.get('/api/download/:token', async (req: Request, res: Response) => {
  const { token } = req.params;

  // 1. Validate token
  const downloadRecord = db.getDownloadByToken(token);
  if (!downloadRecord) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Invalid Download Link</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #FAF9F6; color: #1E231F;">
        <h1 style="color: #b91c1c;">Invalid Download Link</h1>
        <p>This download token does not exist or has been revoked. Please check your purchase confirmation email or contact support.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2D5A43; color: white; text-decoration: none; border-radius: 6px;">Return to Food & Body</a>
      </body>
      </html>
    `);
    return;
  }

  // 2. Check revocation
  if (downloadRecord.is_revoked) {
    res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Access Revoked</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #FAF9F6; color: #1E231F;">
        <h1 style="color: #b91c1c;">Access Denied</h1>
        <p>This download access has been revoked (e.g. order refunded or cancelled).</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2D5A43; color: white; text-decoration: none; border-radius: 6px;">Return to Store</a>
      </body>
      </html>
    `);
    return;
  }

  // 3. Check expiration
  if (new Date(downloadRecord.expires_at).getTime() < Date.now()) {
    res.status(410).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Download Link Expired</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #FAF9F6; color: #1E231F;">
        <h1 style="color: #b91c1c;">Download Link Expired</h1>
        <p>This secure download link has expired. Please contact support@foodandbody.com with your order number to request a link renewal.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2D5A43; color: white; text-decoration: none; border-radius: 6px;">Return to Store</a>
      </body>
      </html>
    `);
    return;
  }

  // 4. Check order entitlement and status
  const order = db.getOrderById(downloadRecord.order_id);
  if (!order || order.payment_status !== 'PAID') {
    res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unverified Purchase</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #FAF9F6; color: #1E231F;">
        <h1 style="color: #b91c1c;">Access Denied</h1>
        <p>The order associated with this download token is not in an active paid state (${order?.payment_status || 'NOT_FOUND'}).</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2D5A43; color: white; text-decoration: none; border-radius: 6px;">Return to Store</a>
      </body>
      </html>
    `);
    return;
  }

  // 5. Check download limits
  if (downloadRecord.download_count >= downloadRecord.max_downloads) {
    res.status(429).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Download Limit Exceeded</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #FAF9F6; color: #1E231F;">
        <h1 style="color: #b91c1c;">Download Limit Reached</h1>
        <p>You have reached the maximum allowed downloads (${downloadRecord.max_downloads}) for this token. Please contact support to reset your limit.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2D5A43; color: white; text-decoration: none; border-radius: 6px;">Return to Store</a>
      </body>
      </html>
    `);
    return;
  }

  // 6. Retrieve product
  const product = db.getProductById(downloadRecord.product_id);
  if (!product) {
    res.status(404).send('Product asset not found.');
    return;
  }

  // 7. Increment download count
  db.incrementDownloadCount(token);

  // Track analytics event
  db.logAnalytics({
    event_name: 'download_started',
    product_id: product.id,
    metadata: { token, orderNumber: order.order_number, downloadCount: downloadRecord.download_count + 1 }
  });

  try {
    // 8. Generate personalized licensed PDF publication
    const pdfBytes = await generateProductPdf(product, order.customer_email, order.order_number);

    const safeFilename = `${product.slug || product.id}-FoodAndBody.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('PDF Generation error:', err);
    res.status(500).send('An error occurred while preparing your digital publication. Please try again.');
  }
});

// 6. Download Metadata Endpoint (inspect token without downloading)
app.get('/api/download/meta/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const record = db.getDownloadByToken(token);
  if (!record) {
    res.status(404).json({ valid: false, error: 'Invalid or missing token' });
    return;
  }

  const order = db.getOrderById(record.order_id);
  const isExpired = new Date(record.expires_at).getTime() < Date.now();
  const isRevoked = record.is_revoked || order?.payment_status !== 'PAID';
  const isLimitReached = record.download_count >= record.max_downloads;

  res.json({
    valid: !isExpired && !isRevoked && !isLimitReached,
    token: record.token,
    productId: record.product_id,
    productName: record.product_name,
    orderNumber: order?.order_number,
    downloadCount: record.download_count,
    maxDownloads: record.max_downloads,
    expiresAt: record.expires_at,
    isExpired,
    isRevoked,
    isLimitReached,
    downloadUrl: `/api/download/${record.token}`
  });
});

// 7. Get Order by ID or Number
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let order = db.getOrderById(id);
  if (!order) {
    order = db.getOrderByNumber(id);
  }

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const downloads = db.getDownloadsForOrder(order.id);
  res.json({
    order,
    downloads: downloads.map(d => ({
      productId: d.product_id,
      productName: d.product_name,
      token: d.token,
      downloadUrl: `/api/download/${d.token}`,
      expiresAt: d.expires_at,
      downloadCount: d.download_count,
      maxDownloads: d.max_downloads,
      isRevoked: d.is_revoked
    }))
  });
});

// 8. Customer Order Lookup (Self-service order retrieval)
app.post('/api/orders/lookup', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Please provide an email address or order number' });
    return;
  }

  const trimmed = query.trim();
  let orders: Order[] = [];

  if (trimmed.includes('@')) {
    orders = db.getOrdersByCustomerEmail(trimmed);
  } else {
    const order = db.getOrderByNumber(trimmed) || db.getOrderById(trimmed);
    if (order) orders = [order];
  }

  const enrichedOrders = orders.map(o => {
    const downloads = db.getDownloadsForOrder(o.id);
    return {
      ...o,
      downloads: downloads.map(d => ({
        productId: d.product_id,
        productName: d.product_name,
        token: d.token,
        downloadUrl: `/api/download/${d.token}`,
        expiresAt: d.expires_at,
        downloadCount: d.download_count,
        maxDownloads: d.max_downloads,
        isRevoked: d.is_revoked
      }))
    };
  });

  res.json({ orders: enrichedOrders });
});

// 9. Analytics Ingestion Endpoint (FR-018)
app.post('/api/analytics', (req: Request, res: Response) => {
  const { event_name, product_id, metadata } = req.body;
  if (!event_name) {
    res.status(400).json({ error: 'Event name is required' });
    return;
  }

  const record = db.logAnalytics({
    event_name,
    product_id,
    metadata
  });

  res.json({ success: true, eventId: record.id });
});

// ----------------- Admin API Endpoints -----------------

// Admin Metrics
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const orders = db.getAllOrders();
  const paidOrders = orders.filter(o => o.payment_status === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const customers = db.getAllCustomers();
  const downloads = db.getAllDownloads();
  const totalDownloads = downloads.reduce((sum, d) => sum + d.download_count, 0);
  const products = db.getAllProducts(true);

  res.json({
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    failedOrders: orders.filter(o => o.payment_status === 'FAILED').length,
    refundedOrders: orders.filter(o => o.payment_status === 'REFUNDED').length,
    totalCustomers: customers.length,
    totalDownloads,
    productsCount: products.length,
    recentOrders: orders.slice(0, 8)
  });
});

// Admin Orders List
app.get('/api/admin/orders', (req: Request, res: Response) => {
  const { status } = req.query;
  let orders = db.getAllOrders();

  if (status && status !== 'ALL') {
    orders = orders.filter(o => o.payment_status === status);
  }

  const enriched = orders.map(o => ({
    ...o,
    downloads: db.getDownloadsForOrder(o.id)
  }));

  res.json({ orders: enriched });
});

// Admin Order Refund (Section 42: Revokes download tokens)
app.post('/api/admin/orders/:id/refund', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateOrderStatus(id, 'REFUNDED');

  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Log refund in emails
  db.logEmail({
    to: updated.customer_email,
    subject: `Order Refunded: ${updated.order_number}`,
    type: 'PURCHASE_CONFIRMATION',
    order_id: updated.id,
    order_number: updated.order_number,
    product_names: updated.items.map(i => i.product_name),
    download_urls: [],
    status: 'SENT',
    content_html: `<p>Your order ${updated.order_number} has been refunded. Associated digital download tokens have been revoked.</p>`
  });

  res.json({ success: true, order: updated });
});

// Admin Resend Delivery Email (Section 47)
app.post('/api/admin/orders/:id/resend-email', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.getOrderById(id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const downloads = db.getDownloadsForOrder(order.id);
  const downloadUrls = downloads.map(d => ({
    product_name: d.product_name,
    token: d.token,
    url: `/api/download/${d.token}`
  }));

  const record = db.logEmail({
    to: order.customer_email,
    subject: `[Re-sent] Your Guide is Ready: ${order.items.map(i => i.product_name).join(', ')}`,
    type: 'RESENT_DELIVERY',
    order_id: order.id,
    order_number: order.order_number,
    product_names: downloads.map(d => d.product_name),
    download_urls: downloadUrls,
    status: 'SENT',
    content_html: `<p>As requested, here are your secure download links for order ${order.order_number}.</p>`
  });

  res.json({ success: true, email: record });
});

// Admin Customers Directory
app.get('/api/admin/customers', (req: Request, res: Response) => {
  const customers = db.getAllCustomers();
  res.json({ customers });
});

// Admin Downloads Tracker
app.get('/api/admin/downloads', (req: Request, res: Response) => {
  const downloads = db.getAllDownloads();
  res.json({ downloads });
});

// Admin Revoke Token
app.post('/api/admin/downloads/:token/revoke', (req: Request, res: Response) => {
  const { token } = req.params;
  const success = db.revokeDownloadToken(token);
  res.json({ success });
});

// Admin Products CRUD (FR-014)
app.post('/api/admin/products', (req: Request, res: Response) => {
  const productData = req.body;
  if (!productData.id || !productData.name || productData.price === undefined) {
    res.status(400).json({ error: 'Product ID, name, and price are required' });
    return;
  }

  const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newProduct: Product = {
    ...productData,
    slug,
    currency: productData.currency || 'USD',
    type: productData.type || 'SINGLE',
    status: productData.status || 'DRAFT',
    benefits: productData.benefits || [],
    whats_included: productData.whats_included || [],
    table_of_contents: productData.table_of_contents || [],
    preview_pages: productData.preview_pages || [],
    faq: productData.faq || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.saveProduct(newProduct);
  res.json({ success: true, product: newProduct });
});

app.patch('/api/admin/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getProductById(id);
  if (!existing) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id, // Immutable ID
    updated_at: new Date().toISOString()
  };

  db.saveProduct(updated);
  res.json({ success: true, product: updated });
});

// Admin Emails Log
app.get('/api/admin/emails', (req: Request, res: Response) => {
  const emails = db.getAllEmails();
  res.json({ emails });
});

// Admin Analytics Log
app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const analytics = db.getAllAnalytics();
  res.json({ analytics });
});

// ----------------- Vite Integration & Server Startup -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food & Body Digital Platform running on http://localhost:${PORT}`);
  });
}

startServer();
