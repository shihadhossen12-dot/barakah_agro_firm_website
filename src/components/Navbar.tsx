import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Truck,
  Package,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import type { Product, Category, SiteSettings } from '../types/ecommerce';

interface NavbarProps {
  products: Product[];
  categories: Category[];
  settings: SiteSettings | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categorySlug: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  products,
  categories,
  settings,
  activeView,
  setActiveView,
  onSelectProduct,
  onSelectCategory,
  onOpenAuth,
}) => {
  const { totalItems, subtotal, setIsDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search suggestions
  const searchSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.banglaName && p.banglaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const matchedCategories = searchQuery.trim()
    ? categories
        .filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.banglaName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const hotline = settings?.hotline || '01786-239185';
  const whatsappNum = settings?.whatsappNumber || '8801786239185';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#14532d] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-medium tracking-wide">
              {settings?.announcementText ||
                '🚚 সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি | ২০০০ টাকার কেনাকাটায় ফ্রি হোম ডেলিভারি'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-100">
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>হটলাইন: {hotline}</span>
            </a>

            <span className="hidden sm:inline opacity-40">|</span>

            <a
              href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                'আসসালামু আলাইকুম, বারাকাহ এগ্রো থেকে পণ্য অর্ডার করতে চাই।'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>হোয়াটসঅ্যাপ অর্ডার</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <img
                src={settings?.logo || '/images/barakah/logo.jpeg'}
                alt="Barakah Agro"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-emerald-600 shadow-xs group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#14532d] flex items-center gap-1">
                  BARAKAH AGRO
                </div>
                <div className="text-[11px] font-medium text-slate-500 tracking-wider">
                  বিশুদ্ধ খাবার, সুস্থ জীবনের জন্য
                </div>
              </div>
            </button>
          </div>

          {/* Large Center Search Bar with Autocomplete */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="খাঁটি সরিষার তেল, সুন্দরবনের মধু, সাজনা পাতা বা যেকোনো পণ্য খুঁজুন..."
                className="w-full pl-4 pr-11 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setActiveView('shop');
                  }
                }}
                className="absolute right-1.5 p-2 bg-[#14532d] hover:bg-[#166534] text-white rounded-md transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && (searchSuggestions.length > 0 || matchedCategories.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {matchedCategories.length > 0 && (
                  <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                      ক্যাটাগরি
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedCategories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSelectCategory(c.slug);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md border border-slate-200 transition-colors"
                        >
                          {c.banglaName || c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    পণ্যসমূহ
                  </div>
                  {searchSuggestions.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left transition-colors group"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-11 h-11 object-cover rounded-md border border-slate-100 bg-slate-50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                          {prod.banglaName || prod.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{prod.category}</span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-700">৳ {prod.price}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setActiveView('shop');
                      setIsSearchFocused(false);
                    }}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    সকল ফলাফল দেখুন →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist Icon */}
            <button
              onClick={() => setActiveView('wishlist')}
              className="relative p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon & Subtotal */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#14532d] rounded-lg transition-colors border border-emerald-200/70"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#14532d] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase font-semibold text-slate-500">কার্ট</span>
                <span className="text-xs font-bold text-slate-900">৳ {subtotal}</span>
              </div>
            </button>

            {/* Account / User */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={customer ? customer.name : 'Login / Account'}
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-xs font-medium text-slate-700 truncate max-w-[100px]">
                {customer ? customer.name : 'লগইন'}
              </span>
            </button>

            {/* Admin Badge */}
            <button
              onClick={() => setActiveView(isAdmin ? 'admin' : 'admin-login')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Admin Panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAdmin ? 'অ্যাডমিন' : 'Admin'}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা ক্যাটাগরি সার্চ করুন..."
              className="w-full pl-3 pr-10 py-2 bg-slate-50 text-sm text-slate-800 rounded-lg border border-slate-200 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim()) setActiveView('shop');
              }}
              className="absolute right-1 p-1.5 bg-[#14532d] text-white rounded-md"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar (Categories & Quick Links) */}
      <nav className="hidden md:block bg-slate-50 border-t border-slate-200 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 py-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'home'
                  ? 'text-[#14532d] bg-emerald-50/80 font-bold'
                  : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              হোম (Home)
            </button>

            <button
              onClick={() => setActiveView('shop')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'shop'
                  ? 'text-[#14532d] bg-emerald-50/80 font-bold'
                  : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              সকল পণ্য (All Shop)
            </button>

            {categories.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.slug)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#14532d] transition-colors whitespace-nowrap"
              >
                {c.banglaName || c.name}
              </button>
            ))}

            <button
              onClick={() => setActiveView('offers')}
              className="px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors flex items-center gap-1"
            >
              <span>🔥 স্পেশাল অফার</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveView('track')}
              className="flex items-center gap-1 px-3 py-1.5 font-medium text-slate-700 hover:text-emerald-800 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>অর্ডার ট্র্যাক করুন</span>
            </button>

            <button
              onClick={() => setActiveView('about')}
              className="font-medium text-slate-600 hover:text-emerald-800 transition-colors"
            >
              আমাদের সম্পর্কে
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                setActiveView('home');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-semibold text-left"
            >
              🏠 হোম পেজ
            </button>
            <button
              onClick={() => {
                setActiveView('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-semibold text-left"
            >
              🛍️ সকল পণ্য
            </button>
            <button
              onClick={() => {
                setActiveView('offers');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-rose-50 text-rose-700 rounded-lg font-semibold text-left"
            >
              🔥 স্পেশাল অফার
            </button>
            <button
              onClick={() => {
                setActiveView('track');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg font-semibold text-left"
            >
              📦 অর্ডার ট্র্যাক
            </button>
          </div>

          <div className="py-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ক্যাটাগরি সমূহ
            </div>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                >
                  {cat.banglaName || cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              className="flex items-center gap-1.5 font-semibold text-emerald-700"
            >
              <Phone className="w-4 h-4" />
              <span>{hotline}</span>
            </a>
            <button
              onClick={() => {
                setActiveView(isAdmin ? 'admin' : 'admin-login');
                setIsMobileMenuOpen(false);
              }}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
