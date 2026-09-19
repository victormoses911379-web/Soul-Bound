import React, { useState, useEffect } from 'react';
import { Product, CheckoutResponse } from '../types.js';
import { initiateCheckout, processPaymentWebhook, trackAnalytics } from '../lib/api.js';
import { X, Lock, CreditCard, ShieldCheck, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (orderData: {
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    downloadTokens: any[];
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [checkoutSession, setCheckoutSession] = useState<CheckoutResponse | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulatedFailure, setSimulatedFailure] = useState(false);

  // Initialize checkout session when opened or email updated
  const loadCheckoutSession = async (email: string) => {
    if (!email || !email.includes('@')) return;
    setIsLoadingSession(true);
    setErrorMessage(null);
    try {
      const session = await initiateCheckout(product.id, email, customerName);
      setCheckoutSession(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize checkout');
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Pre-populate demo credentials for seamless testing
  const handleAutoFillTest = () => {
    const demoEmail = 'victormoses911379@gmail.com';
    setCustomerEmail(demoEmail);
    setCustomerName('Victor Moses');
    setCardNumber('4242 •••• •••• 4242');
    setExpiry('12/28');
    setCvc('888');
    loadCheckoutSession(demoEmail);
  };

  const handleEmailBlur = () => {
    if (customerEmail && customerEmail.includes('@')) {
      loadCheckoutSession(customerEmail);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid customer email address for delivery.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    trackAnalytics('buy_click', product.id, { email: customerEmail });

    try {
      // 1. Ensure validated checkout session exists (backend confirmed price)
      let session = checkoutSession;
      if (!session) {
        session = await initiateCheckout(product.id, customerEmail, customerName);
        setCheckoutSession(session);
      }

      // Generate a unique payment reference (e.g. stripe ch_...)
      const paymentRef = 'pay_' + Math.random().toString(36).substring(2, 12);

      // 2. Simulate Payment Webhook (FR-006, Section 13)
      const webhookPayload = {
        payment_reference: paymentRef,
        payment_provider: 'StripePayment',
        checkout_id: session.checkoutId,
        product_id: product.id,
        customer_email: customerEmail,
        customer_name: customerName || customerEmail.split('@')[0],
        amount: session.totalAmount,
        currency: session.currency,
        status: (simulatedFailure ? 'FAILED' : 'SUCCESS') as 'SUCCESS' | 'FAILED',
        signature: 'sim_sig_' + Math.random().toString(36).substring(2, 10)
      };

      const result = await processPaymentWebhook(webhookPayload);

      if (simulatedFailure) {
        throw new Error('Simulated payment failure (Bank declined transaction). Please try again or toggle test mode.');
      }

      if (result.success) {
        onPaymentSuccess({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          customerEmail: result.customerEmail,
          downloadTokens: result.downloadTokens
        });
      } else {
        throw new Error(result.error || 'Payment could not be verified.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FBFBF9] rounded-2xl border border-[#D5D7D0] max-w-xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E8E3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm font-serif">
              FB
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#191D1A]">
                Secure Digital Checkout
              </h2>
              <p className="text-[11px] text-[#5D645C]">
                256-Bit TLS Encryption • Instant Digital Delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A8177] hover:text-[#191D1A] p-1.5 rounded-md hover:bg-[#EAEAE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Order Summary Box */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E4DC] mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src={product.cover_image}
                alt={product.name}
                className="w-12 h-14 object-cover rounded-md border border-[#E2E4DC]"
              />
              <div>
                <h3 className="font-serif text-sm font-bold text-[#191D1A]">
                  {product.name}
                </h3>
                <span className="text-xs text-[#2D5A43] font-medium">
                  {product.type === 'BUNDLE' ? '3-in-1 Bundle Collection' : 'Digital PDF Guide'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#7A8177] block">Total</span>
              <span className="font-serif text-lg font-bold text-[#191D1A]">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {product.type === 'BUNDLE' && (
            <div className="mt-3 pt-3 border-t border-[#F0F2EB] text-xs text-[#5D645C] space-y-1">
              <span className="font-semibold text-[#855B1B] block mb-1">
                Includes all 3 individual publications:
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                <span>The Complete Egg Health Guide (EGG-001)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                <span>Sugar & Your Body (SUG-001)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                <span>The Complete Fiber Guide (FIB-001)</span>
              </div>
            </div>
          )}
        </div>

        {/* Fast Test Card Fill Helper */}
        <div className="mb-6 p-3 rounded-lg bg-[#EBF2ED] border border-[#D0DFD3] flex items-center justify-between">
          <div className="text-xs text-[#264E3A]">
            <span className="font-bold">Test Mode Active: </span>
            Click to auto-fill test credentials
          </div>
          <button
            type="button"
            onClick={handleAutoFillTest}
            className="px-3 py-1 rounded bg-[#2D5A43] text-white text-xs font-semibold hover:bg-[#234735] transition-colors"
          >
            Fill Test Details
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#FAF0F0] border border-[#ECD1D1] text-xs text-[#9B2C2C] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#9B2C2C] flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D453C] mb-1.5">
              Your Email Address (For Secure PDF Delivery) *
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="customer@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D5D7D0] text-sm text-[#191D1A] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A43]"
            />
            <p className="text-[11px] text-[#7A8177] mt-1">
              Your download token and official receipt will be linked to this email address.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D453C] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Victor Moses"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D5D7D0] text-sm text-[#191D1A] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A43]"
            />
          </div>

          {/* Payment Card Simulator */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D453C] mb-1.5 flex items-center justify-between">
              <span>Card Information</span>
              <span className="text-[11px] font-normal text-[#6B726A] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#2D5A43]" /> Encrypted
              </span>
            </label>
            <div className="rounded-lg border border-[#D5D7D0] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2D5A43]">
              <div className="flex items-center px-3.5 py-2.5 border-b border-[#E8E8E3]">
                <CreditCard className="w-4 h-4 text-[#7A8177] mr-2.5" />
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  className="w-full text-sm text-[#191D1A] focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E8E8E3]">
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM / YY"
                  className="px-3.5 py-2.5 text-sm text-[#191D1A] focus:outline-hidden"
                />
                <input
                  type="text"
                  required
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="CVC"
                  className="px-3.5 py-2.5 text-sm text-[#191D1A] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* QA Failure Simulator Toggle (For Section 41 / 51 QA Acceptance Testing) */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#5D645C] bg-[#F2F2EC] p-2.5 rounded-lg border border-[#DDD]">
            <span>Simulate Payment Failure (QA Mode):</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulatedFailure}
                onChange={(e) => setSimulatedFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9B2C2C]"></div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-lg bg-[#2D5A43] hover:bg-[#224533] disabled:bg-[#8EA698] text-white font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment & Generating Tokens...</span>
                </>
              ) : (
                <span>Pay ${product.price.toFixed(2)} USD & Download Guide</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#7A8177] pt-2">
            <span>✓ Instant PDF access</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ One-time fee</span>
          </div>
        </form>
      </div>
    </div>
  );
};
