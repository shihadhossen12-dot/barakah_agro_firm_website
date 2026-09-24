import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product, Category, ProductVariant } from '../types/ecommerce';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  onOpenProductDetails: (product: Product) => void;
  onInstantBuy: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategorySlug,
  onSelectCategory,
  onOpenProductDetails,
  onInstantBuy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (
          selectedCategorySlug &&
          selectedCategorySlug !== 'all' &&
          p.categorySlug.toLowerCase() !== selectedCategorySlug.toLowerCase()
        ) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            p.name.toLowerCase().includes(q) ||
            (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
            p.category.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Price filter
        if (p.price > maxPrice) {
          return false;
        }

        // Stock filter
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        // Badge filter
        if (selectedBadge !== 'all') {
          if (selectedBadge === 'OFFER' && !(p.isOffer || (p.badges && p.badges.includes('OFFER')))) {
            return false;
          }
          if (selectedBadge === 'BEST SELLING' && !(p.badges && p.badges.includes('BEST SELLING'))) {
            return false;
          }
          if (selectedBadge === 'NEW ARRIVAL' && !(p.badges && p.badges.includes('NEW ARRIVAL'))) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategorySlug, searchQuery, maxPrice, inStockOnly, selectedBadge, sortBy]);

  const activeCategory = categories.find((c) => c.slug === selectedCategorySlug);

  const resetFilters = () => {
    onSelectCategory('all');
    setSearchQuery('');
    setMaxPrice(2000);
    setInStockOnly(false);
    setSelectedBadge('all');
    setSortBy('latest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <span
              onClick={() => onSelectCategory('all')}
              className="cursor-pointer hover:text-emerald-700"
            >
              হোম
            </span>{' '}
            / <span className="font-semibold text-slate-800">সকল পণ্য</span>{' '}
            {activeCategory && (
              <>
                / <span className="text-emerald-800 font-bold">{activeCategory.banglaName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeCategory ? activeCategory.banglaName : 'বারাকাহ এগ্রো শপ'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট {filteredProducts.length}টি বিশুদ্ধ প্রাকৃতিক পণ্য পাওয়া গেছে
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>ফিল্টার</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="latest">নতুন পণ্য আগে</option>
              <option value="popular">জনপ্রিয়তা অনুযায়ী</option>
              <option value="price-asc">দাম: কম থেকে বেশি</option>
              <option value="price-desc">দাম: বেশি থেকে কম</option>
              <option value="rating">সেরা রেটিং</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar Filters (Desktop + Mobile Drawer) */}
        <aside
          className={`md:col-span-3 ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
              : 'hidden md:block'
          } space-y-6`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 md:hidden">
              <h3 className="font-bold text-base text-slate-900">ফিল্টার সমূহ</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Reset Filters button if any active */}
          {(selectedCategorySlug !== 'all' || maxPrice < 2000 || inStockOnly || selectedBadge !== 'all') && (
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}

          {/* Categories List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>ক্যাটাগরি সমূহ</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  if (isMobileFilterOpen) setIsMobileFilterOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  selectedCategorySlug === 'all'
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>সকল পণ্য (All)</span>
                <span className="text-slate-400 text-[11px]">{products.length}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    if (isMobileFilterOpen) setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    selectedCategorySlug === cat.slug
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.banglaName || cat.name}</span>
                  <span className="text-slate-400 text-[11px]">{cat.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              সর্বোচ্চ মূল্য (Price Range)
            </h3>
            <div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-slate-700 mt-2">
                <span>৳ ১০০</span>
                <span className="text-emerald-800 font-black">৳ {maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Filter by Badge */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              অফার ও ব্যাজ
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'সবগুলো' },
                { id: 'OFFER', label: 'স্পেশাল অফার' },
                { id: 'BEST SELLING', label: 'বেস্ট সেলার' },
                { id: 'NEW ARRIVAL', label: 'নতুন আগমন' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadge(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedBadge === b.id
                      ? 'bg-[#14532d] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* In-Stock Switch */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-800">শুধুমাত্র স্টকে থাকা পণ্য</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>

          {isMobileFilterOpen && (
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-[#14532d] text-white font-bold text-xs rounded-xl"
            >
              ফলাফল দেখুন ({filteredProducts.length}টি)
            </button>
          )}
        </aside>

        {/* Right Product Grid */}
        <main className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                কোনো পণ্য খুঁজে পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                আপনার নির্বাচিত ফিল্টার বা ক্যাটাগরির সাথে কোনো পণ্যের মিল পাওয়া যায়নি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#14532d] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                সকল পণ্য দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetails={onOpenProductDetails}
                  onInstantBuy={onInstantBuy}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
