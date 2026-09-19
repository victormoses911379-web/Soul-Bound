import React from 'react';
import { ShieldCheck, AlertCircle, FileText, Lock, RefreshCw } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'privacy' | 'terms' | 'refund' | 'digital' | 'disclaimer') => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate }) => {
  return (
    <footer id="main-footer" className="bg-[#181B19] text-[#E0E2DD] pt-16 pb-12 border-t border-[#2A2E2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2C322E]">
          {/* Brand & Purpose */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-[#3D785A] text-white flex items-center justify-center font-bold text-sm">
                FB
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">
                FOOD & BODY
              </span>
            </div>
            <p className="text-sm text-[#A6ABA3] leading-relaxed mb-4">
              Visual, evidence-based digital guides designed to make biochemistry, organ-level digestion, and daily nutrition understandable.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#82887F]">
              <ShieldCheck className="w-4 h-4 text-[#4E9B73]" />
              <span>Independent science, no brand sponsorships</span>
            </div>
          </div>

          {/* Core Publications */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6ABA3] mb-4">
              Digital Guides
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C8CCC5]">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white transition-colors text-left"
                >
                  The Complete Egg Health Guide ($9.99)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white transition-colors text-left"
                >
                  Sugar & Your Body ($9.99)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white transition-colors text-left"
                >
                  The Complete Fiber Guide ($9.99)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-[#E5B56E] hover:text-[#F3CE92] transition-colors font-medium text-left"
                >
                  Starter Bundle 3-in-1 ($24.99)
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6ABA3] mb-4">
              Delivery & Guarantee
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C8CCC5]">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#4E9B73]" />
                <span>Instant PDF Download Token</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#4E9B73]" />
                <span>Personal DRM Licensed PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#4E9B73]" />
                <span>30-Day Satisfaction Policy</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-xs text-[#8A9086] hover:text-white transition-colors mt-2"
                >
                  Admin Portal & Webhook QA
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6ABA3] mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-sm text-[#A6ABA3]">
              <li>
                <button
                  onClick={() => onOpenLegal('disclaimer')}
                  className="hover:text-white transition-colors text-left font-medium text-[#E5B56E]"
                >
                  Medical & Health Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-white transition-colors text-left"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('digital')}
                  className="hover:text-white transition-colors text-left"
                >
                  Digital Products License
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Health Disclaimer Note (Section 28) */}
        <div className="mt-8 p-4 rounded-lg bg-[#202422] border border-[#2F3531] text-xs text-[#9DA39B] leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#D88F3A] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#C8CCC5] font-semibold">Educational Health Notice: </strong>
            The publications, graphics, and dietary data provided by Food & Body are strictly for educational and informational purposes. They do not constitute personalized medical advice, diagnosis, or treatment. Always consult your qualified healthcare practitioner before implementing dietary modifications or addressing metabolic concerns.
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A8077] gap-4">
          <p>© {new Date().getFullYear()} Food & Body Digital Publishing LLC. All rights reserved.</p>
          <p>Target MVP Launch: October 1, 2026 | System Version 1.0</p>
        </div>
      </div>
    </footer>
  );
};
