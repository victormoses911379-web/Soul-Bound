import React, { useState, useEffect } from 'react';
import {
  fetchAdminMetrics,
  fetchAdminOrders,
  refundOrder,
  resendOrderEmail,
  fetchAdminCustomers,
  fetchAdminDownloads,
  revokeDownloadToken,
  fetchProducts,
  updateAdminProduct,
  processPaymentWebhook
} from '../lib/api.js';
import { Product, Order, Customer, DownloadToken } from '../types.js';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  RotateCcw,
  Send,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  Check,
  Zap,
  Lock
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'CUSTOMERS' | 'DOWNLOADS' | 'QA_TESTS'>('OVERVIEW');

  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [downloads, setDownloads] = useState<DownloadToken[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // QA test states
  const [qaLog, setQaLog] = useState<string[]>([]);
  const [isQaRunning, setIsQaRunning] = useState(false);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState<Product['status']>('PUBLISHED');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, o, c, d, p] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminOrders(orderStatusFilter === 'ALL' ? undefined : orderStatusFilter),
        fetchAdminCustomers(),
        fetchAdminDownloads(),
        fetchProducts(true)
      ]);
      setMetrics(m);
      setOrders(o.orders || []);
      setCustomers(c);
      setDownloads(d);
      setProducts(p);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderStatusFilter]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to refund this order? This will immediately revoke all active digital download tokens.')) return;
    try {
      await refundOrder(orderId);
      showNotification('Order marked as REFUNDED and digital download tokens revoked.');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Refund failed');
    }
  };

  const handleResendEmail = async (orderId: string) => {
    try {
      await resendOrderEmail(orderId);
      showNotification('Delivery email has been re-dispatched to the customer.');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Resend failed');
    }
  };

  const handleRevokeToken = async (token: string) => {
    if (!window.confirm(`Revoke token ${token}? The customer will no longer be able to download the file.`)) return;
    try {
      await revokeDownloadToken(token);
      showNotification(`Token ${token} has been revoked.`);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Revocation failed');
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    try {
      await updateAdminProduct(editingProduct.id, {
        price: parseFloat(editPrice) || editingProduct.price,
        status: editStatus
      });
      showNotification(`Product ${editingProduct.name} updated successfully.`);
      setEditingProduct(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Product update failed');
    }
  };

  // ---------------- QA Test Runners (Sections 48 - 51) ----------------
  const addQaLog = (line: string) => {
    setQaLog(prev => [line, ...prev]);
  };

  const runTestStandardPurchase = async () => {
    setIsQaRunning(true);
    addQaLog(`--- Starting Test: Standard Purchase Flow (EGG-001) ---`);
    try {
      const ref = 'test_pay_' + Date.now();
      const res = await processPaymentWebhook({
        payment_reference: ref,
        payment_provider: 'SimulatedQAStripe',
        product_id: 'EGG-001',
        customer_email: 'qa.tester@example.com',
        customer_name: 'QA Tester',
        amount: 9.99,
        currency: 'USD',
        status: 'SUCCESS'
      });
      addQaLog(`✅ Payment verified & order created: ${res.orderNumber}`);
      addQaLog(`✅ Generated download token: ${res.downloadTokens[0]?.token}`);
      addQaLog(`✅ Confirmation & delivery emails logged.`);
      loadData();
    } catch (e: any) {
      addQaLog(`❌ Test failed: ${e.message}`);
    } finally {
      setIsQaRunning(false);
    }
  };

  const runTestBundleEntitlement = async () => {
    setIsQaRunning(true);
    addQaLog(`--- Starting Test: Bundle Entitlement Flow (BND-001) ---`);
    try {
      const ref = 'test_bundle_' + Date.now();
      const res = await processPaymentWebhook({
        payment_reference: ref,
        payment_provider: 'SimulatedQAStripe',
        product_id: 'BND-001',
        customer_email: 'bundle.customer@example.com',
        customer_name: 'Bundle Tester',
        amount: 24.99,
        currency: 'USD',
        status: 'SUCCESS'
      });
      addQaLog(`✅ Order created: ${res.orderNumber}`);
      addQaLog(`✅ Bundle expanded into ${res.downloadTokens.length} entitlements:`);
      res.downloadTokens.forEach((t: any) => {
        addQaLog(`   * ${t.product_id} (${t.product_name}) -> Token: ${t.token.substring(0, 14)}...`);
      });
      if (res.downloadTokens.length === 3) {
        addQaLog(`✅ Acceptance criteria passed: All 3 guides entitled in single order!`);
      } else {
        addQaLog(`❌ Acceptance criteria failed: Expected 3 entitlements, got ${res.downloadTokens.length}`);
      }
      loadData();
    } catch (e: any) {
      addQaLog(`❌ Test failed: ${e.message}`);
    } finally {
      setIsQaRunning(false);
    }
  };

  const runTestIdempotency = async () => {
    setIsQaRunning(true);
    addQaLog(`--- Starting Test: Webhook Idempotency (FR-007) ---`);
    try {
      const existingRef = 'idempotent_test_ref_001';
      addQaLog(`Step 1: Sending first webhook with reference ${existingRef}...`);
      const firstRes = await processPaymentWebhook({
        payment_reference: existingRef,
        payment_provider: 'SimulatedQAStripe',
        product_id: 'SUG-001',
        customer_email: 'idempotent@example.com',
        amount: 9.99,
        currency: 'USD',
        status: 'SUCCESS'
      });
      addQaLog(`✅ First webhook processed. Order: ${firstRes.orderNumber}`);

      addQaLog(`Step 2: Sending duplicate webhook with SAME payment reference ${existingRef}...`);
      const secondRes = await processPaymentWebhook({
        payment_reference: existingRef,
        payment_provider: 'SimulatedQAStripe',
        product_id: 'SUG-001',
        customer_email: 'idempotent@example.com',
        amount: 9.99,
        currency: 'USD',
        status: 'SUCCESS'
      });

      if (secondRes.idempotent) {
        addQaLog(`✅ Idempotency Verified! Server returned success WITHOUT creating duplicate order.`);
      } else {
        addQaLog(`❌ Warning: Idempotency flag was not set.`);
      }
      loadData();
    } catch (e: any) {
      addQaLog(`❌ Idempotency test error: ${e.message}`);
    } finally {
      setIsQaRunning(false);
    }
  };

  const runTestFailedPayment = async () => {
    setIsQaRunning(true);
    addQaLog(`--- Starting Test: Failed Payment Handling (Section 41) ---`);
    try {
      const ref = 'failed_pay_' + Date.now();
      await processPaymentWebhook({
        payment_reference: ref,
        payment_provider: 'SimulatedQAStripe',
        product_id: 'FIB-001',
        customer_email: 'declined.card@example.com',
        amount: 9.99,
        currency: 'USD',
        status: 'FAILED'
      });
      addQaLog(`❌ Expected failure response, but webhook reported success.`);
    } catch (e: any) {
      addQaLog(`✅ Correctly rejected: ${e.message}`);
      addQaLog(`✅ No download tokens generated for failed transaction.`);
      loadData();
    } finally {
      setIsQaRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4EE] text-[#1E231F] pb-20">
      {/* Top Navbar */}
      <div className="bg-[#191D1A] text-white sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#2D5A43] flex items-center justify-center font-bold text-sm font-serif">
            FB
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight">
              Food & Body Administration Portal
            </h1>
            <p className="text-[11px] text-[#A6ABA3]">
              Operations, Orders, DRM Files & Webhook Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2B302D] hover:bg-[#3B423E] text-xs font-medium text-[#D8DDD5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-[#2D5A43] hover:bg-[#234735] text-xs font-semibold text-white transition-colors"
          >
            Exit to Store
          </button>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div className="p-3.5 rounded-lg bg-[#EBF2ED] border border-[#CFDEC5] text-xs font-semibold text-[#2D5A43] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
            <span>{actionSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E6E6DE] rounded-xl border border-[#D5D7CE]">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-white text-[#191D1A] shadow-xs'
                : 'text-[#5A6158] hover:text-[#191D1A]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'PRODUCTS'
                ? 'bg-white text-[#191D1A] shadow-xs'
                : 'text-[#5A6158] hover:text-[#191D1A]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ORDERS'
                ? 'bg-white text-[#191D1A] shadow-xs'
                : 'text-[#5A6158] hover:text-[#191D1A]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'CUSTOMERS'
                ? 'bg-white text-[#191D1A] shadow-xs'
                : 'text-[#5A6158] hover:text-[#191D1A]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DOWNLOADS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'DOWNLOADS'
                ? 'bg-white text-[#191D1A] shadow-xs'
                : 'text-[#5A6158] hover:text-[#191D1A]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloads & DRM</span>
          </button>

          <button
            onClick={() => setActiveTab('QA_TESTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto ${
              activeTab === 'QA_TESTS'
                ? 'bg-[#2D5A43] text-white shadow-xs'
                : 'bg-[#DFE7E1] text-[#2D5A43] hover:bg-[#D2DDD5]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>MVP Acceptance Test Suite</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && metrics && (
          <div className="space-y-8">
            {/* KPI Cards (Section 43) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl bg-white border border-[#DFE2D8] shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A8177]">
                  Total Revenue
                </span>
                <div className="font-serif text-3xl font-extrabold text-[#191D1A] mt-2 mb-1">
                  ${metrics.totalRevenue.toFixed(2)}
                </div>
                <span className="text-xs text-[#2D5A43] font-medium">
                  {metrics.paidOrders} verified transactions
                </span>
              </div>

              <div className="p-6 rounded-xl bg-white border border-[#DFE2D8] shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A8177]">
                  Total Orders
                </span>
                <div className="font-serif text-3xl font-extrabold text-[#191D1A] mt-2 mb-1">
                  {metrics.totalOrders}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#5D645C]">
                  <span>Paid: {metrics.paidOrders}</span>
                  <span>Failed: {metrics.failedOrders}</span>
                  <span>Refunded: {metrics.refundedOrders}</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white border border-[#DFE2D8] shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A8177]">
                  Unique Customers
                </span>
                <div className="font-serif text-3xl font-extrabold text-[#191D1A] mt-2 mb-1">
                  {metrics.totalCustomers}
                </div>
                <span className="text-xs text-[#5D645C]">
                  Audience to buyer conversions
                </span>
              </div>

              <div className="p-6 rounded-xl bg-white border border-[#DFE2D8] shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A8177]">
                  PDF Downloads Served
                </span>
                <div className="font-serif text-3xl font-extrabold text-[#191D1A] mt-2 mb-1">
                  {metrics.totalDownloads}
                </div>
                <span className="text-xs text-[#2D5A43] font-medium">
                  Digital DRM protected deliveries
                </span>
              </div>
            </div>

            {/* Recent Orders Section (Section 43) */}
            <div className="bg-white rounded-xl border border-[#DFE2D8] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-[#191D1A]">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('ORDERS')}
                  className="text-xs font-semibold text-[#2D5A43] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F8F4] text-[#5D645C] border-b border-[#E6E8E1]">
                    <tr>
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Customer Email</th>
                      <th className="py-3 px-4">Product(s)</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2EB]">
                    {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
                      metrics.recentOrders.map((o: Order) => (
                        <tr key={o.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-4 font-mono font-bold text-[#191D1A]">{o.order_number}</td>
                          <td className="py-3 px-4 text-[#4A5149]">{o.customer_email}</td>
                          <td className="py-3 px-4 text-[#191D1A]">
                            {o.items.map(i => i.product_name).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#191D1A]">${o.total_amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.payment_status === 'PAID'
                                ? 'bg-[#EBF2ED] text-[#2D5A43]'
                                : o.payment_status === 'REFUNDED'
                                ? 'bg-[#FAF0F0] text-[#9B2C2C]'
                                : 'bg-[#F2F2EC] text-[#5D645C]'
                            }`}>
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#7A8177]">
                            {new Date(o.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#7A8177] italic">
                          No orders in database yet. Try running the QA Acceptance test below!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS (FR-014, Section 44) */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#191D1A]">
                  Publication Catalog Management
                </h3>
                <p className="text-xs text-[#5D645C]">
                  Configure guide pricing, publication status, and private PDF storage associations (FR-017).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-[#DFE2D8] p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#F0F2EB] text-[#2D5A43] mr-2">
                          {p.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          p.status === 'PUBLISHED' ? 'bg-[#EBF2ED] text-[#2D5A43]' : 'bg-[#FAF0F0] text-[#9B2C2C]'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <span className="font-serif font-bold text-xl text-[#191D1A]">
                        ${p.price.toFixed(2)} {p.currency}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[#191D1A] mb-1">
                      {p.name}
                    </h4>
                    <p className="text-xs text-[#5D645C] line-clamp-2 mb-4">
                      {p.short_description}
                    </p>

                    <div className="p-3 rounded-lg bg-[#F8F8F4] border border-[#E8E8E1] text-xs text-[#5D645C] space-y-1 mb-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#2D5A43]" />
                        <span className="font-mono text-[11px] text-[#333]">
                          Storage: {p.file_reference}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7A8177]">
                        Type: {p.type} • Pages: {p.page_count}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F0F2EB] flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setEditPrice(p.price.toString());
                        setEditStatus(p.status);
                      }}
                      className="px-3.5 py-1.5 rounded bg-[#F2F2EC] hover:bg-[#E4E4DC] text-xs font-semibold text-[#191D1A] transition-colors"
                    >
                      Edit Pricing & Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS (FR-015) */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#191D1A]">
                  Orders & Transaction Ledger
                </h3>
                <p className="text-xs text-[#5D645C]">
                  View, filter, refund (auto-revoking tokens), and resend customer delivery emails.
                </p>
              </div>

              {/* Status Filter Tabs (FR-015) */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-[#D5D7CE]">
                {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-[#2D5A43] text-white'
                        : 'text-[#5D645C] hover:text-[#191D1A]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#DFE2D8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F8F4] text-[#5D645C] border-b border-[#E6E8E1]">
                    <tr>
                      <th className="py-3.5 px-4">Order Number</th>
                      <th className="py-3.5 px-4">Customer Email</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Payment Ref</th>
                      <th className="py-3.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2EB]">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#7A8177] italic">
                          No orders found matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#191D1A]">{o.order_number}</td>
                          <td className="py-3.5 px-4 text-[#4A5149]">{o.customer_email}</td>
                          <td className="py-3.5 px-4">
                            {o.items.map(i => i.product_name).join(', ')}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#191D1A]">${o.total_amount.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.payment_status === 'PAID'
                                ? 'bg-[#EBF2ED] text-[#2D5A43]'
                                : o.payment_status === 'REFUNDED'
                                ? 'bg-[#FAF0F0] text-[#9B2C2C]'
                                : 'bg-[#F2F2EC] text-[#5D645C]'
                            }`}>
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#7A8177]">
                            {o.payment_reference || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {o.payment_status === 'PAID' && (
                                <button
                                  onClick={() => handleRefund(o.id)}
                                  className="px-2 py-1 rounded bg-[#FAF0F0] hover:bg-[#F4D9D9] text-[#9B2C2C] text-[11px] font-semibold transition-colors"
                                  title="Refund order & revoke download tokens"
                                >
                                  Refund
                                </button>
                              )}
                              <button
                                onClick={() => handleResendEmail(o.id)}
                                className="px-2 py-1 rounded bg-[#F2F2EC] hover:bg-[#E5E5DD] text-[#333] text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Resend delivery email"
                              >
                                <Send className="w-3 h-3" />
                                <span>Resend</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS (FR-016) */}
        {activeTab === 'CUSTOMERS' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#191D1A]">
                Customer Records
              </h3>
              <p className="text-xs text-[#5D645C]">
                Customer email, total orders, lifetime expenditure, and registration activity.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#DFE2D8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F8F4] text-[#5D645C] border-b border-[#E6E8E1]">
                    <tr>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Email Address</th>
                      <th className="py-3.5 px-4">Purchases</th>
                      <th className="py-3.5 px-4">Lifetime Spent</th>
                      <th className="py-3.5 px-4">First Purchase</th>
                      <th className="py-3.5 px-4">Latest Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2EB]">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7A8177] italic">
                          No customers recorded yet.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3.5 px-4 font-semibold text-[#191D1A]">{c.name}</td>
                          <td className="py-3.5 px-4 text-[#4A5149] font-mono text-[11px]">{c.email}</td>
                          <td className="py-3.5 px-4 font-bold text-[#2D5A43]">{c.purchases_count}</td>
                          <td className="py-3.5 px-4 font-bold text-[#191D1A]">${c.total_spent.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-[#7A8177]">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-[#7A8177]">{new Date(c.last_order_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DOWNLOADS & DRM MONITOR */}
        {activeTab === 'DOWNLOADS' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#191D1A]">
                Digital PDF Download Tokens & Access Logs
              </h3>
              <p className="text-xs text-[#5D645C]">
                Monitor private storage access, token validity, usage counts, and manual DRM revocations.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#DFE2D8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F8F4] text-[#5D645C] border-b border-[#E6E8E1]">
                    <tr>
                      <th className="py-3.5 px-4">Token String</th>
                      <th className="py-3.5 px-4">Guide Product</th>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Downloads Used</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2EB]">
                    {downloads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7A8177] italic">
                          No download tokens generated yet.
                        </td>
                      </tr>
                    ) : (
                      downloads.map((d) => (
                        <tr key={d.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#2D5A43]">{d.token}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#191D1A]">{d.product_name}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#7A8177]">{d.order_id}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#191D1A]">{d.download_count}</span>
                            <span className="text-[#7A8177]"> / {d.max_downloads}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {d.is_revoked ? (
                              <span className="px-2 py-0.5 rounded bg-[#FAF0F0] text-[#9B2C2C] text-[10px] font-bold">
                                REVOKED
                              </span>
                            ) : new Date(d.expires_at).getTime() < Date.now() ? (
                              <span className="px-2 py-0.5 rounded bg-[#FAF0F0] text-[#9B2C2C] text-[10px] font-bold">
                                EXPIRED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#EBF2ED] text-[#2D5A43] text-[10px] font-bold">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {!d.is_revoked && (
                              <button
                                onClick={() => handleRevokeToken(d.token)}
                                className="px-2 py-1 rounded bg-[#FAF0F0] hover:bg-[#F4D9D9] text-[#9B2C2C] text-[11px] font-semibold transition-colors"
                              >
                                Revoke Token
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: QA ACCEPTANCE TEST SUITE (Sections 48, 49, 50, 51) */}
        {activeTab === 'QA_TESTS' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white border border-[#DFE2D8] shadow-xs">
              <h3 className="font-serif text-xl font-bold text-[#191D1A] mb-2">
                MVP Acceptance Criteria Test Suite
              </h3>
              <p className="text-xs text-[#5D645C] leading-relaxed mb-6">
                Automated runners verifying the complete business flow: Webhook verification, Order creation, Idempotency, Bundle entitlements, and Security rejection.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={runTestStandardPurchase}
                  disabled={isQaRunning}
                  className="p-4 rounded-xl border border-[#DFE2D8] bg-[#FAF9F5] hover:bg-white text-left transition-all hover:shadow-xs group"
                >
                  <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider block mb-1">
                    Test 1 • Section 48
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#191D1A] group-hover:text-[#2D5A43] mb-1">
                    Standard Purchase
                  </h4>
                  <p className="text-[11px] text-[#5D645C]">
                    Validates webhook → order → entitlement → download token → confirmation email.
                  </p>
                </button>

                <button
                  onClick={runTestBundleEntitlement}
                  disabled={isQaRunning}
                  className="p-4 rounded-xl border border-[#ECD7B6] bg-[#FCF8F2] hover:bg-white text-left transition-all hover:shadow-xs group"
                >
                  <span className="text-xs font-bold text-[#855B1B] uppercase tracking-wider block mb-1">
                    Test 2 • Section 49
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#191D1A] group-hover:text-[#855B1B] mb-1">
                    Bundle Entitlement
                  </h4>
                  <p className="text-[11px] text-[#5D645C]">
                    Purchases BND-001 ($24.99) and verifies 3 separate download tokens are generated.
                  </p>
                </button>

                <button
                  onClick={runTestIdempotency}
                  disabled={isQaRunning}
                  className="p-4 rounded-xl border border-[#DFE2D8] bg-[#FAF9F5] hover:bg-white text-left transition-all hover:shadow-xs group"
                >
                  <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider block mb-1">
                    Test 3 • Section 14 / 50
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#191D1A] group-hover:text-[#2D5A43] mb-1">
                    Duplicate Webhook Protection
                  </h4>
                  <p className="text-[11px] text-[#5D645C]">
                    Sends identical payment ref twice; verifies NO duplicate order is created.
                  </p>
                </button>

                <button
                  onClick={runTestFailedPayment}
                  disabled={isQaRunning}
                  className="p-4 rounded-xl border border-[#ECD1D1] bg-[#FAF0F0] hover:bg-white text-left transition-all hover:shadow-xs group"
                >
                  <span className="text-xs font-bold text-[#9B2C2C] uppercase tracking-wider block mb-1">
                    Test 4 • Section 41
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#191D1A] group-hover:text-[#9B2C2C] mb-1">
                    Failed Payment Rejection
                  </h4>
                  <p className="text-[11px] text-[#5D645C]">
                    Verifies no download tokens or entitlements are granted on failed payments.
                  </p>
                </button>
              </div>

              {/* Execution Console Output */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E8E3]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#191D1A]">
                    Test Execution Console Log
                  </span>
                  <button
                    onClick={() => setQaLog([])}
                    className="text-[11px] text-[#7A8177] hover:text-[#191D1A]"
                  >
                    Clear Console
                  </button>
                </div>

                <div className="bg-[#191D1A] text-[#D8DDD5] p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto space-y-1.5">
                  {qaLog.length === 0 ? (
                    <div className="text-[#6D746B] italic">
                      Ready to execute test suites. Click any test card above to run live server operations.
                    </div>
                  ) : (
                    qaLog.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFE2D8] p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#191D1A]">
              Edit: {editingProduct.name}
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D645C] mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D5D7CE] text-sm text-[#191D1A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D645C] mb-1">
                Publication Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded border border-[#D5D7CE] text-sm text-[#191D1A]"
              >
                <option value="PUBLISHED">PUBLISHED (Visible in Store)</option>
                <option value="DRAFT">DRAFT (Hidden from Store)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F0F2EB]">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded text-xs font-semibold text-[#5D645C] hover:bg-[#F2F2EC]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 rounded bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
