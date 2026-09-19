import React, { useState } from 'react';
import { lookupOrders } from '../lib/api.js';
import { Order, DownloadToken } from '../types.js';
import { X, Search, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<(Order & { downloads: DownloadToken[] })[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setOrders(null);

    try {
      const results = await lookupOrders(query.trim());
      if (results.length === 0) {
        setErrorMessage('No orders found matching that email address or order reference.');
      } else {
        setOrders(results);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lookup failed. Please check your query and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FBFBF9] rounded-2xl border border-[#D5D7D0] max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E8E3]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#191D1A]">
              Lookup Your Purchases & Downloads
            </h2>
            <p className="text-xs text-[#5D645C] mt-0.5">
              Enter your purchase email address or order number (e.g. ORD-20261001-...)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A8177] hover:text-[#191D1A] p-1.5 rounded-md hover:bg-[#EAEAE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A8177] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter customer email or ORD-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#D5D7D0] text-sm text-[#191D1A] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A43]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold transition-colors disabled:bg-[#8EA698] flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Downloads'}
            </button>
          </div>
        </form>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FAF0F0] border border-[#ECD1D1] text-xs text-[#9B2C2C] flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 text-[#9B2C2C] flex-shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Results display */}
        {orders && orders.length > 0 && (
          <div className="space-y-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2D5A43]">
              Found {orders.length} Order(s)
            </div>

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#DFE2D8] p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0F2EB] text-xs">
                  <div>
                    <span className="text-[#7A8177]">Order: </span>
                    <strong className="text-[#191D1A] font-mono">{order.order_number}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.payment_status === 'PAID'
                        ? 'bg-[#EBF2ED] text-[#2D5A43]'
                        : order.payment_status === 'REFUNDED'
                        ? 'bg-[#FAF0F0] text-[#9B2C2C]'
                        : 'bg-[#F4F4EE] text-[#5D645C]'
                    }`}>
                      {order.payment_status}
                    </span>
                    <span className="text-[#7A8177]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Order Items & Downloads */}
                <div className="space-y-3">
                  {order.downloads && order.downloads.length > 0 ? (
                    order.downloads.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F9F9F6] border border-[#E8E8E3] text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#2D5A43]" />
                          <div>
                            <span className="font-semibold text-[#191D1A] block">
                              {d.product_name}
                            </span>
                            <span className="text-[10px] text-[#7A8177]">
                              Downloads: {d.download_count}/{d.max_downloads}
                            </span>
                          </div>
                        </div>

                        {d.is_revoked || order.payment_status !== 'PAID' ? (
                          <span className="text-[11px] font-semibold text-[#9B2C2C]">
                            Access Revoked
                          </span>
                        ) : (
                          <a
                            href={`/api/download/${d.token}`}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2D5A43] hover:bg-[#234735] text-white text-[11px] font-semibold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#7A8177] italic">
                      No active digital tokens associated with this order.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
