import React from 'react';
import { BookOpen, Shield, Inbox, Search, Youtube, Sparkles, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
  onOpenOrderLookup: () => void;
  onOpenInbox: () => void;
  unreadEmailsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenOrderLookup,
  onOpenInbox,
  unreadEmailsCount
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#E8E8E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <div
            id="brand-logo"
            onClick={() => onNavigate('home')}
            className="cursor-pointer group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-[#2D5A43] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-[#234735] transition-colors">
              <span className="font-serif">FB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1E231F] group-hover:text-[#2D5A43] transition-colors">
                  FOOD & BODY
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#EBF2ED] text-[#2D5A43] border border-[#D5E3D8]">
                  EVIDENCE-BASED
                </span>
              </div>
              <p className="text-xs text-[#6B726A] font-medium tracking-wide">
                Digital Publishing Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A5149]">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`transition-colors hover:text-[#1E231F] ${currentView === 'home' ? 'text-[#2D5A43] font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              id="nav-shop"
              onClick={() => onNavigate('shop')}
              className={`transition-colors hover:text-[#1E231F] ${currentView === 'shop' ? 'text-[#2D5A43] font-semibold' : ''}`}
            >
              All Guides
            </button>
            <button
              id="nav-bundle"
              onClick={() => onNavigate('product', 'food-and-body-starter-bundle')}
              className="flex items-center gap-1.5 text-[#855B1B] hover:text-[#674410] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B87D24]" />
              Starter Bundle (-17%)
            </button>
            <button
              id="nav-methodology"
              onClick={() => {
                if (currentView !== 'home') onNavigate('home');
                setTimeout(() => {
                  document.getElementById('methodology-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-[#1E231F] transition-colors"
            >
              Methodology
            </button>
            <button
              id="nav-youtube"
              onClick={() => {
                if (currentView !== 'home') onNavigate('home');
                setTimeout(() => {
                  document.getElementById('youtube-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center gap-1 text-[#4A5149] hover:text-[#C4302B] transition-colors"
            >
              <Youtube className="w-4 h-4 text-[#C4302B]" />
              YouTube Series
            </button>
          </nav>

          {/* Utility / Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Order Lookup */}
            <button
              id="btn-order-lookup"
              onClick={onOpenOrderLookup}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3A4139] bg-[#F2F2EC] hover:bg-[#E6E6DF] rounded-md transition-colors border border-[#DDDDD5]"
              title="Lookup purchases and download links"
            >
              <Search className="w-3.5 h-3.5 text-[#5A6159]" />
              <span className="hidden sm:inline">My Downloads</span>
            </button>

            {/* Email Inbox Demo Drawer */}
            <button
              id="btn-open-inbox"
              onClick={onOpenInbox}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2D5A43] bg-[#EBF2ED] hover:bg-[#DEECE1] rounded-md transition-colors border border-[#CFDFD3]"
              title="Customer Delivery Emails"
            >
              <Inbox className="w-3.5 h-3.5 text-[#2D5A43]" />
              <span className="hidden sm:inline">Delivery Emails</span>
              {unreadEmailsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-[#2D5A43] rounded-full">
                  {unreadEmailsCount}
                </span>
              )}
            </button>

            {/* Admin Switch */}
            <button
              id="btn-admin-portal"
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                currentView === 'admin'
                  ? 'bg-[#1E231F] text-white'
                  : 'bg-white text-[#1E231F] hover:bg-[#F2F2EC] border border-[#D5D7D0]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#6B726A]" />
              <span className="font-semibold">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
