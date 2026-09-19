import React from 'react';
import { Product } from '../types.js';
import { ArrowRight, CheckCircle2, FileText, Sparkles, Youtube, Play, ShieldCheck, Clock, Download, ChevronRight } from 'lucide-react';

interface HomeViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onInitiateBuy: (product: Product) => void;
  onNavigate: (view: string, slug?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onSelectProduct,
  onInitiateBuy,
  onNavigate
}) => {
  const singleGuides = products.filter(p => p.type === 'SINGLE');
  const bundle = products.find(p => p.type === 'BUNDLE');

  const youtubeCards = [
    {
      id: 'yt-1',
      title: 'What Happens in Your Liver When You Eat 3 Eggs a Day?',
      duration: '14:22',
      views: '840K views',
      companionSlug: 'complete-egg-health-guide',
      companionName: 'The Complete Egg Health Guide',
      thumbnail: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
      description: 'Animated step-by-step breakdown of enterocyte absorption, cholesterol packaging, and LDL receptor kinetics.'
    },
    {
      id: 'yt-2',
      title: 'Glucose vs Fructose: How Sugar Hijacks Your Metabolism',
      duration: '18:05',
      views: '1.2M views',
      companionSlug: 'sugar-and-your-body',
      companionName: 'Sugar & Your Body',
      thumbnail: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80',
      description: 'Why your body treats liquid fructose entirely differently from whole fruit, and how insulin spikes trigger lipogenesis.'
    },
    {
      id: 'yt-3',
      title: 'The Short-Chain Fatty Acid Revolution: Feeding Your Colon',
      duration: '16:40',
      views: '620K views',
      companionSlug: 'complete-fiber-guide',
      companionName: 'The Complete Fiber Guide',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      description: 'How microbial fermentation of prebiotic fiber creates butyrate, repairs gut permeability, and signals satiety.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section (FR-001) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E8E8E3] bg-gradient-to-b from-[#FAF9F5] to-[#F5F5EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF2ED] border border-[#D5E3D8] text-xs font-semibold text-[#2D5A43] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A43]" />
              Evidence-Based Digital Nutrition Publishing
            </div>

            {/* Main Required Hero Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191D1A] tracking-tight leading-[1.1] mb-6">
              Understand What Happens Inside Your Body.
            </h1>

            {/* Supporting Message */}
            <p className="text-lg sm:text-xl text-[#4D554C] leading-relaxed mb-8 max-w-2xl font-normal">
              Visual, evidence-based guides that make food and nutrition easier to understand. Molecular biochemistry and digestion translated into actionable infographics.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-explore-guides"
                onClick={() => onNavigate('shop')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#2D5A43] hover:bg-[#234735] text-white font-medium text-base shadow-sm transition-colors"
              >
                <span>Explore the Guides</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-watch-youtube"
                onClick={() => {
                  document.getElementById('youtube-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-white hover:bg-[#F0F0EA] text-[#1E231F] font-medium text-base border border-[#D5D7D0] transition-colors"
              >
                <Youtube className="w-4 h-4 text-[#C4302B]" />
                <span>Watch on YouTube</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-[#E2E4DC] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#5D645C]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
                <span>Peer-Reviewed Citations</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
                <span>Instant PDF Downloads</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
                <span>100% Sponsor-Free Science</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-[#2D5A43]">
              Core Publications
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#191D1A] mt-1">
              Individual Visual Guides
            </h2>
            <p className="text-sm text-[#5D645C] mt-2 max-w-xl">
              Each publication features 50+ illustrated pages exploring molecular mechanisms, digestion kinetics, and evidence-based protocols.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-4 sm:mt-0 text-sm font-semibold text-[#2D5A43] hover:text-[#1E3E2E] flex items-center gap-1 group"
          >
            <span>View All Guides</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {singleGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-xl border border-[#E6E8E1] overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
            >
              {/* Cover Image Container */}
              <div
                className="relative h-64 overflow-hidden bg-[#F0EFEB] cursor-pointer"
                onClick={() => onSelectProduct(guide)}
              >
                <img
                  src={guide.cover_image}
                  alt={guide.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#191D1A]/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                  {guide.id}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#2D5A43] text-[11px] font-bold px-2.5 py-1 rounded shadow-sm">
                  {guide.page_count} Pages
                </div>
              </div>

              {/* Guide Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6B726A] mb-2">
                    <span className="font-medium text-[#2D5A43]">Digital PDF Edition</span>
                    <span className="font-bold text-base text-[#191D1A]">${guide.price.toFixed(2)}</span>
                  </div>

                  <h3
                    onClick={() => onSelectProduct(guide)}
                    className="font-serif text-xl font-bold text-[#191D1A] hover:text-[#2D5A43] cursor-pointer transition-colors leading-snug mb-2"
                  >
                    {guide.name}
                  </h3>

                  <p className="text-sm text-[#5D645C] line-clamp-2 mb-4 leading-relaxed">
                    {guide.short_description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0F2EB] flex items-center gap-2.5">
                  <button
                    onClick={() => onSelectProduct(guide)}
                    className="flex-1 py-2.5 px-3 rounded-md bg-[#F4F5F0] hover:bg-[#EAECE4] text-xs font-semibold text-[#292F28] transition-colors text-center"
                  >
                    View Guide
                  </button>
                  <button
                    onClick={() => onInitiateBuy(guide)}
                    className="flex-1 py-2.5 px-3 rounded-md bg-[#2D5A43] hover:bg-[#234735] text-xs font-semibold text-white transition-colors text-center shadow-sm"
                  >
                    Get Guide (${guide.price.toFixed(2)})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bundle Promotion Banner (Section 7, Section 17) */}
      {bundle && (
        <section className="py-12 bg-[#F6F4EE] border-y border-[#E8E5DD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-[#DFDDD2] p-8 md:p-12 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E1] border border-[#ECD9BD] text-xs font-bold text-[#8C5D17] mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-[#B57C28]" />
                    MOST POPULAR & COMPLETE COLLECTION
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#191D1A] mb-3">
                    {bundle.name}
                  </h2>

                  <p className="text-base text-[#4D554C] leading-relaxed mb-6">
                    {bundle.description} Includes all 3 foundational publications: The Complete Egg Health Guide, Sugar & Your Body, and The Complete Fiber Guide.
                  </p>

                  <div className="space-y-2.5 mb-8">
                    {bundle.whats_included.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-sm text-[#2D332C]">
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-4 mb-6">
                    <span className="font-serif text-3xl font-extrabold text-[#191D1A]">
                      ${bundle.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-[#858C83] line-through">
                      $29.97
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF2ED] text-[#2D5A43] text-xs font-bold">
                      Save over 15%
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onInitiateBuy(bundle)}
                      className="px-7 py-3 rounded-md bg-[#2D5A43] hover:bg-[#234735] text-white font-medium text-sm transition-colors shadow-sm"
                    >
                      Get Complete Bundle (${bundle.price.toFixed(2)})
                    </button>
                    <button
                      onClick={() => onSelectProduct(bundle)}
                      className="px-5 py-3 rounded-md bg-[#F2F2EC] hover:bg-[#E6E6DE] text-[#2D332C] font-medium text-sm transition-colors"
                    >
                      View Bundle Details
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-sm">
                    <img
                      src={bundle.cover_image}
                      alt={bundle.name}
                      className="w-full h-80 object-cover rounded-xl shadow-md border border-[#DEDCCE]"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-[#191D1A] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg">
                      Instant 3-in-1 Download
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* The Educational Methodology Section (FR-001) */}
      <section id="methodology-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-[#2D5A43]">
            Our Educational Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#191D1A] mt-2 mb-4">
            How Food & Body Makes Complex Science Click
          </h2>
          <p className="text-base text-[#5D645C] leading-relaxed">
            Most nutrition content either talks down to you with shallow rules, or overwhelms you with dense academic jargon. We bridge the gap with visual physiology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-xl bg-white border border-[#E6E8E1] flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-[#EBF2ED] text-[#2D5A43] flex items-center justify-center font-bold font-serif mb-4">
              01
            </div>
            <h3 className="font-serif text-lg font-bold text-[#191D1A] mb-2">
              Organ Digestion Maps
            </h3>
            <p className="text-sm text-[#5D645C] leading-relaxed">
              Trace food step-by-step from mastication and stomach acid through duodenal enzymes and microbiome fermentation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E6E8E1] flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-[#EBF2ED] text-[#2D5A43] flex items-center justify-center font-bold font-serif mb-4">
              02
            </div>
            <h3 className="font-serif text-lg font-bold text-[#191D1A] mb-2">
              Molecular Pathways
            </h3>
            <p className="text-sm text-[#5D645C] leading-relaxed">
              Clear diagrams of GLUT4 receptors, hepatic LDL regulation, insulin sensitivity, and short-chain fatty acid synthesis.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E6E8E1] flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-[#EBF2ED] text-[#2D5A43] flex items-center justify-center font-bold font-serif mb-4">
              03
            </div>
            <h3 className="font-serif text-lg font-bold text-[#191D1A] mb-2">
              Evidence Hierarchy
            </h3>
            <p className="text-sm text-[#5D645C] leading-relaxed">
              Citations are weighted by study design: systematic reviews, randomized controlled trials, and human kinetic studies over animal models.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E6E8E1] flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-[#EBF2ED] text-[#2D5A43] flex items-center justify-center font-bold font-serif mb-4">
              04
            </div>
            <h3 className="font-serif text-lg font-bold text-[#191D1A] mb-2">
              Kitchen Translation
            </h3>
            <p className="text-sm text-[#5D645C] leading-relaxed">
              Practical culinary temperature rules, prebiotic food pairing matrices, and gentle digestive adaptation ladders.
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Content to Commerce Section (FR-001 & Business Model) */}
      <section id="youtube-section" className="py-20 bg-[#F4F4EE] border-t border-[#E5E5DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#C4302B] text-xs font-bold uppercase tracking-wider mb-2">
                <Youtube className="w-4 h-4" />
                <span>From YouTube Series to Deep-Dive Guide</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#191D1A]">
                Watched the Video? Get the Full Handbook.
              </h2>
              <p className="text-sm text-[#5D645C] mt-2 max-w-xl">
                Our free YouTube episodes introduce the core concepts. The digital publications provide the complete references, cheat sheets, and step-by-step protocols.
              </p>
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-md bg-[#C4302B] hover:bg-[#AC2622] text-white transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Subscribe on YouTube</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {youtubeCards.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl border border-[#DFE2D8] overflow-hidden flex flex-col shadow-xs"
              >
                <div className="relative h-48 overflow-hidden bg-black/90 group">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#C4302B] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    {video.views}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#191D1A] mb-2 leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs text-[#5D645C] leading-relaxed mb-4">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0F2EB] flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#2D5A43] truncate max-w-[150px]">
                      {video.companionName}
                    </span>
                    <button
                      onClick={() => onNavigate('product', video.companionSlug)}
                      className="text-xs font-semibold text-[#191D1A] hover:text-[#2D5A43] flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
