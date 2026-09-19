import React, { useState } from 'react';
import { Product } from '../types.js';
import {
  CheckCircle2,
  FileText,
  Lock,
  Download,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Eye,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  onInitiateBuy: (product: Product) => void;
  onBack: () => void;
  onOpenLegal: (tab: 'privacy' | 'terms' | 'refund' | 'digital' | 'disclaimer') => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onInitiateBuy,
  onBack,
  onOpenLegal
}) => {
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isBundle = product.type === 'BUNDLE';

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5D645C] hover:text-[#191D1A] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Guides</span>
      </button>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        {/* Left column: Cover & Previews */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-[#DFE1D8] shadow-sm bg-white">
            <img
              src={product.cover_image}
              alt={product.name}
              className="w-full h-auto object-cover max-h-[480px]"
            />
            <div className="absolute top-4 left-4 bg-[#191D1A]/85 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded">
              {product.id}
            </div>
            {isBundle ? (
              <div className="absolute top-4 right-4 bg-[#855B1B] text-white text-xs font-bold px-3.5 py-1 rounded shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Bundle (3-in-1)
              </div>
            ) : (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#2D5A43] text-xs font-bold px-3 py-1 rounded shadow-sm">
                Digital PDF • {product.page_count} Pages
              </div>
            )}
          </div>

          {/* Quick Security & Format Perks */}
          <div className="grid grid-cols-2 gap-3 text-xs text-[#5D645C]">
            <div className="p-3 rounded-lg bg-white border border-[#E6E8E1] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
              <span>Instant Download Token</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#E6E8E1] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
              <span>Personal DRM License</span>
            </div>
          </div>
        </div>

        {/* Right column: Title, Pricing, Overview & CTA */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Format Pill */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A43] px-2.5 py-0.5 rounded bg-[#EBF2ED] border border-[#D5E3D8]">
                {product.type === 'BUNDLE' ? 'Digital Bundle Collection' : 'Digital PDF Publication'}
              </span>
              <span className="text-xs text-[#7A8177]">
                Single-User Educational License
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#191D1A] tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#5D645C] font-normal italic mb-6">
              {product.subtitle}
            </p>

            {/* Price Box */}
            <div className="p-5 rounded-xl bg-white border border-[#E2E4DC] mb-6 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#7A8177] uppercase tracking-wider font-semibold block mb-1">
                  Immediate Access Price
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-4xl font-extrabold text-[#191D1A]">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-[#5D645C]">
                    USD • One-time purchase
                  </span>
                  {isBundle && (
                    <span className="text-sm text-[#8A9086] line-through">
                      $29.97
                    </span>
                  )}
                </div>
              </div>

              {isBundle && (
                <div className="px-3 py-1 bg-[#FAF0E1] border border-[#ECD9BD] rounded text-xs font-bold text-[#8C5D17]">
                  Save 17% Today
                </div>
              )}
            </div>

            {/* Primary Purchase CTA */}
            <div className="space-y-3 mb-8">
              <button
                id="btn-buy-guide-detail"
                onClick={() => onInitiateBuy(product)}
                className={`w-full py-4 px-6 rounded-lg text-base font-semibold text-white transition-colors shadow-md flex items-center justify-center gap-2 ${
                  isBundle
                    ? 'bg-[#855B1B] hover:bg-[#6E4912]'
                    : 'bg-[#2D5A43] hover:bg-[#224533]'
                }`}
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Get The Guide – ${product.price.toFixed(2)}</span>
              </button>
              <p className="text-center text-xs text-[#7A8177]">
                Delivered instantly as a high-resolution PDF download token & emailed confirmation.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191D1A] mb-3">
                Key Science & Takeaways
              </h3>
              <div className="space-y-2.5">
                {product.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-[#3E453D] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A43] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="p-5 rounded-xl bg-[#F4F4EE] border border-[#E3E5DD]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191D1A] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2D5A43]" />
                <span>What's Included in Your Download</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#4A5249]">
                {product.whats_included.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A43]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sample Chapter / Page Previewer */}
      {product.preview_pages && product.preview_pages.length > 0 && (
        <section className="mb-20 pt-10 border-t border-[#E8E8E3]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#2D5A43] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#2D5A43]" />
                Inside the Publication
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#191D1A] mt-1">
                Visual Sample Pages
              </h2>
              <p className="text-sm text-[#5D645C] mt-1">
                Preview sample excerpts and biochemical infographics from this handbook.
              </p>
            </div>

            {/* Preview Navigation tabs */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              {product.preview_pages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    activePreviewIndex === idx
                      ? 'bg-[#191D1A] text-white'
                      : 'bg-white text-[#5D645C] hover:bg-[#F0F0EA] border border-[#D5D7D0]'
                  }`}
                >
                  Page {page.pageNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Active Preview Display Box */}
          <div className="bg-white rounded-2xl border border-[#DFE1D8] p-8 md:p-10 shadow-xs">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between text-xs text-[#7A8177] pb-4 mb-6 border-b border-[#F0F2EB]">
                <span className="font-mono font-medium text-[#2D5A43]">
                  SAMPLE EXCERPT • PAGE {product.preview_pages[activePreviewIndex].pageNumber}
                </span>
                <span className="text-[11px] bg-[#F2F3EC] px-2 py-0.5 rounded text-[#5D645C]">
                  {product.name}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#191D1A] mb-2">
                {product.preview_pages[activePreviewIndex].title}
              </h3>
              <p className="text-sm text-[#2D5A43] font-medium mb-6">
                {product.preview_pages[activePreviewIndex].subtitle}
              </p>

              <div className="p-6 rounded-xl bg-[#F9F9F6] border-l-4 border-[#2D5A43] mb-6">
                <p className="text-base text-[#2A3129] leading-relaxed italic">
                  "{product.preview_pages[activePreviewIndex].excerpt}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#191D1A] mb-3">
                  Infographic Focus Elements on This Page:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {product.preview_pages[activePreviewIndex].highlightPoints.map((pt, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white border border-[#E6E8E1] text-xs font-medium text-[#3A4138] flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A43] flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Table of Contents & Chapter Breakdown */}
      <section className="mb-20 pt-10 border-t border-[#E8E8E3]">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold tracking-wider uppercase text-[#2D5A43] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#2D5A43]" />
            Curriculum
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#191D1A] mt-1">
            Complete Table of Contents
          </h2>
          <p className="text-sm text-[#5D645C] mt-1">
            Each chapter includes molecular kinetics, organ diagrams, clinical trial citations, and kitchen implementation.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E4DC] divide-y divide-[#F0F2EB]">
          {product.table_of_contents.map((chapter, idx) => (
            <div key={idx} className="p-5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-serif font-bold text-base text-[#2D5A43] w-8">
                  {idx < 9 ? `0${idx + 1}` : idx + 1}
                </span>
                <span className="text-sm font-semibold text-[#191D1A]">
                  {chapter}
                </span>
              </div>
              <span className="text-xs text-[#7A8177] font-mono hidden sm:inline">
                Verified Science
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      {product.faq && product.faq.length > 0 && (
        <section className="mb-20 pt-10 border-t border-[#E8E8E3]">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold tracking-wider uppercase text-[#2D5A43] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#2D5A43]" />
              Questions & Answers
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#191D1A] mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 max-w-4xl">
            {product.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-[#E2E4DC] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <span className="text-base font-semibold text-[#191D1A]">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#7A8177] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#2D5A43]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-[#4D554C] leading-relaxed border-t border-[#F0F2EB] pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Health Disclaimer Callout (Section 9 & Section 28) */}
      <div className="p-6 rounded-xl bg-[#FAF6F6] border border-[#ECDCDC] text-xs text-[#6F4E4E] leading-relaxed flex items-start gap-3 mb-12">
        <AlertCircle className="w-5 h-5 text-[#B94A48] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#843B39] font-semibold block mb-1">
            Mandatory Health & Educational Disclaimer
          </strong>
          This digital publication ({product.name}) is compiled strictly for educational, informational, and general wellness purposes. It is not a substitute for individualized clinical consultation, diagnosis, or prescription from a licensed physician or registered dietitian.
          <button
            onClick={() => onOpenLegal('disclaimer')}
            className="ml-2 font-semibold underline text-[#843B39] hover:text-[#522423]"
          >
            Read Full Medical Disclaimer
          </button>
        </div>
      </div>

      {/* Bottom Sticky Purchase Bar */}
      <div className="p-6 rounded-2xl bg-white border border-[#DFE1D8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#191D1A]">
            Ready to dive into {product.name}?
          </h3>
          <p className="text-xs text-[#5D645C]">
            Instant access to the 50+ page illustrated PDF guide. 30-day money-back guarantee.
          </p>
        </div>
        <button
          onClick={() => onInitiateBuy(product)}
          className={`px-7 py-3 rounded-md text-sm font-semibold text-white transition-colors shadow-sm flex items-center gap-2 ${
            isBundle
              ? 'bg-[#855B1B] hover:bg-[#6E4912]'
              : 'bg-[#2D5A43] hover:bg-[#224533]'
          }`}
        >
          <span>Get Instant Access (${product.price.toFixed(2)})</span>
        </button>
      </div>
    </div>
  );
};
