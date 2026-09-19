import React, { useState, useEffect } from 'react';
import { fetchAdminEmails } from '../lib/api.js';
import { EmailRecord } from '../types.js';
import { X, Mail, Download, RefreshCw, CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';

interface CustomerInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerInboxDrawer: React.FC<CustomerInboxDrawerProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminEmails();
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (e) {
      console.error('Error loading emails:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FBFBF9] w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-[#D5D7D0]">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E8E8E3] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EBF2ED] text-[#2D5A43]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#191D1A]">
                Customer Email Deliveries
              </h2>
              <p className="text-[11px] text-[#5D645C]">
                Verification of automated purchase receipts and secure download emails (FR-012, FR-013)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadEmails}
              disabled={isLoading}
              className="p-2 text-[#5D645C] hover:text-[#191D1A] rounded-md hover:bg-[#F2F2EC] transition-colors"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#7A8177] hover:text-[#191D1A] rounded-md hover:bg-[#F2F2EC] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Email List Column */}
          <div className="md:col-span-5 border-r border-[#E8E8E3] overflow-y-auto divide-y divide-[#EAECE4] bg-[#F7F7F3]">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7A8177]">
                <Mail className="w-8 h-8 text-[#C4C8BE] mx-auto mb-2" />
                <p>No delivery emails generated yet.</p>
                <p className="mt-1 text-[11px]">Make a test purchase or run the QA webhook test to see notifications.</p>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id
                      ? 'bg-white border-l-4 border-[#2D5A43] shadow-xs'
                      : 'hover:bg-[#EFEFEA]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#7A8177] mb-1">
                    <span className="font-semibold text-[#2D5A43] uppercase tracking-wider">
                      {email.type === 'DELIVERY' ? 'Download Ready' : 'Order Receipt'}
                    </span>
                    <span>{new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="font-serif text-xs font-bold text-[#191D1A] line-clamp-1 mb-1">
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-[#5D645C] line-clamp-1">
                    To: {email.to}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Email Detail Column */}
          <div className="md:col-span-7 bg-white overflow-y-auto p-6">
            {selectedEmail ? (
              <div className="space-y-6">
                {/* Email Header Info */}
                <div className="pb-4 border-b border-[#E8E8E3]">
                  <div className="flex items-center justify-between text-xs text-[#7A8177] mb-2">
                    <span>From: <strong>delivery@foodandbody.com</strong></span>
                    <span className="flex items-center gap-1 text-[#2D5A43]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#191D1A] mb-1">
                    {selectedEmail.subject}
                  </h3>
                  <div className="text-xs text-[#5D645C]">
                    <span>To: <strong>{selectedEmail.to}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Order: <code className="font-mono text-[11px]">{selectedEmail.order_number}</code></span>
                  </div>
                </div>

                {/* Email Body Card */}
                <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E8E8E1] space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#2D5A43] text-white flex items-center justify-center font-bold text-xs font-serif">
                      FB
                    </div>
                    <span className="font-serif text-sm font-bold text-[#191D1A]">
                      Food & Body Publishing
                    </span>
                  </div>

                  <div className="text-sm text-[#3A4138] leading-relaxed space-y-3">
                    <p>Dear Reader,</p>
                    <p>
                      Your transaction for <strong>{selectedEmail.product_names.join(', ')}</strong> has been processed and authenticated.
                    </p>
                    <p>
                      Your single-reader educational license has been applied to the digital document(s). You can download your high-resolution visual guide(s) at any time:
                    </p>
                  </div>

                  {/* Action Download Buttons inside email */}
                  {selectedEmail.download_urls && selectedEmail.download_urls.length > 0 && (
                    <div className="pt-2 space-y-2.5">
                      {selectedEmail.download_urls.map((dl, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg bg-white border border-[#DFE2D8] flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-[#2D5A43]" />
                            <span className="text-xs font-bold text-[#191D1A]">
                              {dl.product_name}
                            </span>
                          </div>
                          <a
                            href={dl.url}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#EAECE4] text-[11px] text-[#7A8177] space-y-1">
                    <p>• Download links are valid for 30 days and permit up to 10 device downloads.</p>
                    <p>• Need assistance? Contact our team at support@foodandbody.com.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7A8177]">
                Select an email from the list to view formatted message.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
