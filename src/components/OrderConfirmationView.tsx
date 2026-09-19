import React, { useState } from 'react';
import { DownloadToken } from '../types.js';
import { CheckCircle2, Download, FileText, Mail, ShieldCheck, Copy, Check, ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';

interface OrderConfirmationViewProps {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  downloadTokens: any[];
  onOpenInbox: () => void;
  onNavigateHome: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  orderId,
  orderNumber,
  customerEmail,
  downloadTokens,
  onOpenInbox,
  onNavigateHome
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/api/download/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Return to store button */}
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5D645C] hover:text-[#191D1A] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Food & Body Store</span>
      </button>

      {/* Success Badge Banner */}
      <div className="bg-white rounded-2xl border border-[#D8DFD7] p-8 md:p-10 shadow-sm mb-10 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#EBF2ED] text-[#2D5A43] flex items-center justify-center mx-auto mb-4 border border-[#CFDEC5]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A43] px-3 py-1 rounded-full bg-[#EBF2ED]">
          Payment Verified • Order Completed
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191D1A] mt-3 mb-2">
          Your Guides are Ready for Download
        </h1>

        <p className="text-sm text-[#5D645C] max-w-lg mx-auto leading-relaxed mb-6">
          Thank you for your purchase. We have verified your transaction and generated your official licensed digital copies below.
        </p>

        {/* Order Meta Bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-6 p-4 rounded-xl bg-[#F9F9F6] border border-[#E6E8E1] text-xs text-[#4A5149]">
          <div>
            <span className="text-[#7A8177] block text-[11px]">Order Number</span>
            <span className="font-mono font-bold text-[#191D1A]">{orderNumber}</span>
          </div>
          <div className="h-6 w-px bg-[#E0E2DC] hidden sm:block" />
          <div>
            <span className="text-[#7A8177] block text-[11px]">Licensed Buyer</span>
            <span className="font-semibold text-[#191D1A]">{customerEmail}</span>
          </div>
          <div className="h-6 w-px bg-[#E0E2DC] hidden sm:block" />
          <div>
            <span className="text-[#7A8177] block text-[11px]">Entitlements</span>
            <span className="font-semibold text-[#2D5A43]">{downloadTokens.length} PDF Publication(s)</span>
          </div>
        </div>
      </div>

      {/* Entitled Publications Download Section */}
      <div className="mb-12">
        <h2 className="font-serif text-2xl font-bold text-[#191D1A] mb-2">
          Digital Publications ({downloadTokens.length})
        </h2>
        <p className="text-xs text-[#5D645C] mb-6">
          Click below to initiate your secure download. These files are stored in private server storage and authenticated with your unique token.
        </p>

        <div className="space-y-4">
          {downloadTokens.map((item, idx) => {
            const downloadUrl = `/api/download/${item.token}`;
            const isCopied = copiedToken === item.token;

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#DFE2D8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-[#2D5A43] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-14 rounded-lg bg-[#F4F5F0] text-[#2D5A43] flex items-center justify-center border border-[#E2E4DC] flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A43] px-2 py-0.5 rounded bg-[#EBF2ED]">
                        {item.product_id}
                      </span>
                      <span className="text-xs text-[#7A8177]">
                        Digital PDF Publication
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#191D1A]">
                      {item.product_name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-[#7A8177] mt-1">
                      <span>Expires: 30 days</span>
                      <span>•</span>
                      <span>Max 10 downloads</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-[#5D645C]">
                        Token: {item.token.substring(0, 12)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleCopyLink(item.token)}
                    className="p-2.5 rounded-lg border border-[#D5D7D0] text-[#5D645C] hover:text-[#191D1A] hover:bg-[#F2F2EC] text-xs font-medium transition-colors"
                    title="Copy Secure Download Link"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-[#2D5A43]" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={downloadUrl}
                    download
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Delivery Notification Banner */}
      <div className="p-6 rounded-2xl bg-[#F6F7F2] border border-[#DFE2D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white border border-[#DDE1D6] text-[#2D5A43]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-[#191D1A]">
              Delivery Email Dispatched
            </h4>
            <p className="text-xs text-[#5D645C] leading-relaxed mt-0.5">
              We also sent your official receipt and download access links directly to <strong>{customerEmail}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInbox}
          className="px-4 py-2 rounded-lg bg-white hover:bg-[#EAECE4] border border-[#D0D4C8] text-xs font-semibold text-[#191D1A] transition-colors whitespace-nowrap"
        >
          View Sent Email in Inbox
        </button>
      </div>

      {/* DRM & License Terms summary */}
      <div className="mt-8 text-center text-xs text-[#7A8177]">
        <p>
          Your license allows personal viewing across your own devices. Sharing or re-distributing these copyrighted publications violates digital terms of service.
        </p>
      </div>
    </div>
  );
};
