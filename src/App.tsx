import React, { useState, useEffect } from 'react';
import { Product } from './types.js';
import { fetchProducts, fetchAdminEmails, trackAnalytics } from './lib/api.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomeView } from './components/HomeView.js';
import { ShopView } from './components/ShopView.js';
import { ProductDetailView } from './components/ProductDetailView.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { OrderConfirmationView } from './components/OrderConfirmationView.js';
import { OrderLookupModal } from './components/OrderLookupModal.js';
import { CustomerInboxDrawer } from './components/CustomerInboxDrawer.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { LegalModal } from './components/LegalModal.js';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product' | 'confirmation' | 'admin'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Modals & Drawers
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);

  const [legalModalState, setLegalModalState] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms' | 'refund' | 'digital' | 'disclaimer';
  }>({
    isOpen: false,
    tab: 'disclaimer'
  });

  // Latest completed order for confirmation view
  const [completedOrderData, setCompletedOrderData] = useState<{
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    downloadTokens: any[];
  } | null>(null);

  // Load products on mount
  useEffect(() => {
    async function init() {
      try {
        const list = await fetchProducts();
        setProducts(list);
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    init();
  }, []);

  // Poll sent emails to update inbox badge
  useEffect(() => {
    async function checkEmails() {
      try {
        const emails = await fetchAdminEmails();
        setUnreadEmailsCount(emails.length);
      } catch (e) {
        // Ignore
      }
    }
    checkEmails();
    const interval = setInterval(checkEmails, 10000);
    return () => clearInterval(interval);
  }, []);

  // Track page views and sync title
  useEffect(() => {
    trackAnalytics('page_view', undefined, { view: currentView, slug: selectedProductSlug });

    if (currentView === 'home') {
      document.title = 'Food & Body – Evidence-Based Digital Nutrition Guides';
    } else if (currentView === 'shop') {
      document.title = 'All Publications – Food & Body';
    } else if (currentView === 'product') {
      const p = products.find(prod => prod.slug === selectedProductSlug);
      if (p) {
        document.title = `${p.name} – Food & Body`;
      }
    } else if (currentView === 'confirmation') {
      document.title = 'Order Confirmed – Food & Body';
    } else if (currentView === 'admin') {
      document.title = 'Admin Operations Portal – Food & Body';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProductSlug, products]);

  const handleNavigate = (view: string, slug?: string) => {
    if (view === 'product' && slug) {
      setSelectedProductSlug(slug);
      setCurrentView('product');
    } else if (view === 'shop') {
      setCurrentView('shop');
    } else if (view === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('home');
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductSlug(product.slug);
    setCurrentView('product');
    trackAnalytics('product_view', product.id);
  };

  const handleInitiateBuy = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
    trackAnalytics('checkout_started', product.id);
  };

  const handlePaymentSuccess = (orderData: {
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    downloadTokens: any[];
  }) => {
    setCompletedOrderData(orderData);
    setIsCheckoutOpen(false);
    setCurrentView('confirmation');
    setUnreadEmailsCount(prev => prev + 2); // Receipt + Delivery
  };

  const selectedProduct = products.find(p => p.slug === selectedProductSlug);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1E231F]">
      {/* Global Header (hidden in admin mode to maximize dashboard real estate) */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          onOpenInbox={() => setIsInboxOpen(true)}
          unreadEmailsCount={unreadEmailsCount}
        />
      )}

      {/* Main Views */}
      <main className="flex-1">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 text-[#2D5A43] animate-spin" />
            <p className="text-xs text-[#5D645C] font-medium">Loading publications...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                products={products}
                onSelectProduct={handleSelectProduct}
                onInitiateBuy={handleInitiateBuy}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'shop' && (
              <ShopView
                products={products}
                onSelectProduct={handleSelectProduct}
                onInitiateBuy={handleInitiateBuy}
              />
            )}

            {currentView === 'product' && selectedProduct && (
              <ProductDetailView
                product={selectedProduct}
                onInitiateBuy={handleInitiateBuy}
                onBack={() => setCurrentView('shop')}
                onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab })}
              />
            )}

            {currentView === 'confirmation' && completedOrderData && (
              <OrderConfirmationView
                orderId={completedOrderData.orderId}
                orderNumber={completedOrderData.orderNumber}
                customerEmail={completedOrderData.customerEmail}
                downloadTokens={completedOrderData.downloadTokens}
                onOpenInbox={() => setIsInboxOpen(true)}
                onNavigateHome={() => setCurrentView('home')}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard
                onClose={() => setCurrentView('home')}
                onNavigateHome={() => setCurrentView('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer (hidden in admin mode) */}
      {currentView !== 'admin' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab })}
        />
      )}

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Order Lookup Modal */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
      />

      {/* Customer Delivery Email Drawer */}
      <CustomerInboxDrawer
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
      />

      {/* Legal & Medical Disclaimer Modal */}
      <LegalModal
        initialTab={legalModalState.tab}
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
