import React, { useState, useMemo } from 'react';
import { Product } from '../types.js';
import { Filter, Sparkles, BookOpen, Check, ArrowRight } from 'lucide-react';

interface ShopViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onInitiateBuy: (product: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  onSelectProduct,
  onInitiateBuy
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SINGLE' | 'BUNDLE'>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC'>('FEATURED');

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.status === 'PUBLISHED');

    if (filterType !== 'ALL') {
      list = list.filter(p => p.type === filterType);
    }

    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, filterType, sortBy]);

  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <span className="text-xs font-bold tracking-wider uppercase text-[#2D5A43]">
          Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#191D1A] mt-2 mb-4">
          Digital Nutrition & Physiology Guides
        </h1>
        <p className="text-base text-[#5D645C] leading-relaxed">
          Immediate, secure PDF publications crafted for readers who want rigorous, visually structured science without dietary Dogma.
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E6E8E1]">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'ALL'
                ? 'bg-[#2D5A43] text-white'
                : 'bg-white text-[#4A5149] hover:bg-[#F2F2EC] border border-[#D5D7D0]'
            }`}
          >
            All Publications ({products.filter(p => p.status === 'PUBLISHED').length})
          </button>
          <button
            onClick={() => setFilterType('SINGLE')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'SINGLE'
                ? 'bg-[#2D5A43] text-white'
                : 'bg-white text-[#4A5149] hover:bg-[#F2F2EC] border border-[#D5D7D0]'
            }`}
          >
            Single Guides
          </button>
          <button
            onClick={() => setFilterType('BUNDLE')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'BUNDLE'
                ? 'bg-[#855B1B] text-white'
                : 'bg-white text-[#855B1B] hover:bg-[#FAF3E8] border border-[#ECD7B6]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#B87D24]" />
            Starter Bundle (-17%)
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-[#5D645C]">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md bg-white border border-[#D5D7D0] text-xs text-[#191D1A] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#2D5A43]"
          >
            <option value="FEATURED">Featured</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const isBundle = product.type === 'BUNDLE';
          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl border ${
                isBundle ? 'border-[#ECD7B6] ring-1 ring-[#ECD7B6]' : 'border-[#E6E8E1]'
              } overflow-hidden flex flex-col hover:shadow-md transition-shadow group`}
            >
              {/* Product Cover */}
              <div
                className="relative h-64 overflow-hidden bg-[#F0EFEB] cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={product.cover_image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#191D1A]/85 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                  {product.id}
                </div>
                {isBundle ? (
                  <div className="absolute top-3 right-3 bg-[#855B1B] text-white text-[11px] font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    3-in-1 Bundle
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#2D5A43] text-[11px] font-bold px-2.5 py-1 rounded shadow-sm">
                    {product.page_count} Pages
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6B726A] mb-2">
                    <span className="font-semibold text-[#2D5A43] uppercase tracking-wider text-[11px]">
                      {product.type === 'BUNDLE' ? 'Collection' : 'Single Publication'}
                    </span>
                    <span className="font-serif font-bold text-xl text-[#191D1A]">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <h2
                    onClick={() => onSelectProduct(product)}
                    className="font-serif text-xl font-bold text-[#191D1A] hover:text-[#2D5A43] cursor-pointer transition-colors leading-snug mb-2"
                  >
                    {product.name}
                  </h2>

                  <p className="text-sm text-[#5D645C] line-clamp-2 mb-4 leading-relaxed">
                    {product.short_description}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    {product.benefits.slice(0, 2).map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#424840]">
                        <Check className="w-3.5 h-3.5 text-[#2D5A43] flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 border-t border-[#F0F2EB] flex items-center gap-2.5">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="flex-1 py-2.5 px-3 rounded-md bg-[#F4F5F0] hover:bg-[#EAECE4] text-xs font-semibold text-[#292F28] transition-colors text-center"
                  >
                    View Guide
                  </button>
                  <button
                    onClick={() => onInitiateBuy(product)}
                    className={`flex-1 py-2.5 px-3 rounded-md text-xs font-semibold text-white transition-colors text-center shadow-sm ${
                      isBundle
                        ? 'bg-[#855B1B] hover:bg-[#6D4913]'
                        : 'bg-[#2D5A43] hover:bg-[#234735]'
                    }`}
                  >
                    Get Guide (${product.price.toFixed(2)})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
