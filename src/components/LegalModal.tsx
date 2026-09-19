import React from 'react';
import { X, ShieldAlert, FileText, AlertCircle, RefreshCw, Lock } from 'lucide-react';

interface LegalModalProps {
  initialTab: 'privacy' | 'terms' | 'refund' | 'digital' | 'disclaimer';
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab, isOpen, onClose }) => {
  const [tab, setTab] = React.useState(initialTab);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FBFBF9] rounded-2xl border border-[#D5D7D0] max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E8E3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm font-serif">
              FB
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#191D1A]">
                Legal Terms & Policies
              </h2>
              <p className="text-[11px] text-[#5D645C]">
                Food & Body Digital Publishing LLC (Section 28 Compliance)
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

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#EAEAE4] rounded-lg mb-6 text-xs font-semibold">
          <button
            onClick={() => setTab('disclaimer')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'disclaimer'
                ? 'bg-[#B94A48] text-white'
                : 'text-[#5D645C] hover:text-[#191D1A]'
            }`}
          >
            Health Disclaimer
          </button>
          <button
            onClick={() => setTab('digital')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'digital'
                ? 'bg-[#2D5A43] text-white'
                : 'text-[#5D645C] hover:text-[#191D1A]'
            }`}
          >
            Digital Products License
          </button>
          <button
            onClick={() => setTab('refund')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'refund'
                ? 'bg-[#2D5A43] text-white'
                : 'text-[#5D645C] hover:text-[#191D1A]'
            }`}
          >
            Refund Policy
          </button>
          <button
            onClick={() => setTab('terms')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'terms'
                ? 'bg-[#2D5A43] text-white'
                : 'text-[#5D645C] hover:text-[#191D1A]'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'privacy'
                ? 'bg-[#2D5A43] text-white'
                : 'text-[#5D645C] hover:text-[#191D1A]'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content Tab Details */}
        <div className="flex-1 overflow-y-auto text-xs text-[#3D453C] leading-relaxed space-y-4 pr-2">
          {tab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FAF0F0] border border-[#ECD1D1] text-[#9B2C2C] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#9B2C2C] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm mb-1 text-[#842323]">
                    CRITICAL MEDICAL & HEALTH DISCLAIMER
                  </h4>
                  <p>
                    All content, illustrations, guides, protocols, and biochemical diagrams created by Food & Body are strictly for educational and informational purposes.
                  </p>
                </div>
              </div>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">1. Not Healthcare Advice</h4>
              <p>
                Nothing contained within our digital publications, website, or social videos constitutes clinical medical advice, individualized dietary diagnosis, or prescription of therapeutic courses. The guides explain general human physiology and nutrition research published in peer-reviewed scientific journals.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">2. Mandatory Physician Consultation</h4>
              <p>
                Prior to undertaking significant modifications to your caloric intake, macronutrient ratios, fiber titration, or dietary lipid consumption—especially if you have pre-existing cardiovascular conditions, diabetes, renal impairment, or gastrointestinal disorders—you must consult your licensed physician or registered dietitian.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">3. Individual Variability</h4>
              <p>
                Nutritional kinetics and biochemical responses (such as LDL particle density, glucose excursion profiles, or colonic gas production) vary significantly based on genetics, microbiome diversity, and medications. We make no warranty that your metabolic parameters will replicate clinical study averages.
              </p>
            </div>
          )}

          {tab === 'digital' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EBF2ED] border border-[#CFDEC5] text-[#2D5A43] flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#2D5A43] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm mb-1">
                    Single-Reader Digital License Agreement
                  </h4>
                  <p>
                    Each guide purchased receives a unique cryptographic token and buyer licensing watermark.
                  </p>
                </div>
              </div>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">1. Granted Rights</h4>
              <p>
                Upon payment verification, Food & Body grants you a non-exclusive, non-transferable, personal revocable license to download and store one copy of the digital PDF on your personal devices (computers, tablets, smartphones, and e-readers) for personal non-commercial study.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">2. Prohibited Conduct</h4>
              <p>
                You may not reproduce, redistribute, re-upload to public repositories, resell, sub-license, broadcast, or extract illustrations or text from these publications. Digital watermarks identifying the purchasing email address are embedded into the PDF payload.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">3. Token Limitations</h4>
              <p>
                Download tokens are valid for thirty (30) days from the order date with an entitlement threshold of ten (10) device downloads to prevent automated harvesting.
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F6F7F2] border border-[#DFE2D8] flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-[#2D5A43] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm mb-1 text-[#191D1A]">
                    30-Day Digital Satisfaction Guarantee
                  </h4>
                  <p className="text-[#5D645C]">
                    We want you to find immense clarity in our visual guides. If you are unsatisfied, we offer a transparent refund policy.
                  </p>
                </div>
              </div>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">1. Eligibility Window</h4>
              <p>
                Refund requests must be submitted within thirty (30) calendar days of initial purchase to support@foodandbody.com containing your order number (e.g. ORD-...).
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">2. Token Revocation (Section 42)</h4>
              <p>
                Upon processing a refund, the order status in our database is transitioned to REFUNDED, and all associated digital download tokens are immediately revoked. Subsequent download attempts will result in access denial.
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-[#191D1A]">1. Acceptance of Terms</h4>
              <p>
                By accessing the Food & Body digital publication store and completing purchases, you agree to be bound by these Terms of Service, applicable laws, and copyright standards.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">2. Pricing & Currency</h4>
              <p>
                All prices are stated in United States Dollars (USD). Final order amounts are determined strictly by server-side catalog values at time of checkout.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">3. Modifications to Publications</h4>
              <p>
                Food & Body reserves the right to release revised editions, update scientific citations, and adjust product availability without prior notice.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-[#191D1A]">1. Information We Collect</h4>
              <p>
                We collect your email address and name during checkout strictly to generate your order records, deliver digital access tokens, and send purchase receipts. We do not store full credit card numbers on our servers; card details are handled via PCI-compliant payment integrations.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">2. Use of Information</h4>
              <p>
                Your email is used to dispatch your digital publication tokens and deliver customer support. We never sell, rent, or trade your personal email address to third-party marketing lists.
              </p>

              <h4 className="font-serif text-sm font-bold text-[#191D1A]">3. Data Retention</h4>
              <p>
                Order transaction records are retained in our database to ensure that you can look up your purchases and re-download your entitlements in the future.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-6 border-t border-[#E8E8E3] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
