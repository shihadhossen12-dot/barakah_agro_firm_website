import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Phone,
  MessageCircle,
  Star,
  Clock,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product, Category, SiteSettings, SiteReview, ProductVariant } from '../types/ecommerce';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  settings: SiteSettings | null;
  reviews: SiteReview[];
  onNavigate: (view: string) => void;
  onSelectCategory: (slug: string) => void;
  onOpenProductDetails: (product: Product) => void;
  onInstantBuy: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  settings,
  reviews,
  onNavigate,
  onSelectCategory,
  onOpenProductDetails,
  onInstantBuy,
}) => {
  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const headline = settings?.heroHeadline || 'বিশুদ্ধ খাবার, সুস্থ জীবনের প্রতিশ্রুতি';
  const subheadline =
    settings?.heroSubheadline ||
    'কাঠের ঘানিতে ভাঙ্গা খাঁটি সরিষার তেল ও test123 পুষ্টিকর সুপারফুড সরাসরি আপনার ঘরে।';
  const heroImg = settings?.heroImage || '/images/generated/hero_agro_farm_1790250221055.jpg';
  const hotline = settings?.hotline || '01786-239185';
  const whatsapp = settings?.whatsappNumber || '8801786239185';

  const flashSaleProducts = products.filter((p) => p.isOffer || (p.badges && p.badges.includes('OFFER'))).slice(0, 4);
  const bestSellers = products.filter((p) => p.badges && p.badges.includes('BEST SELLING')).slice(0, 4);
  const newArrivals = products.filter((p) => p.badges && p.badges.includes('NEW ARRIVAL')).slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* ==========================================
          1. HERO SECTION
          ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#14532d]/10 via-emerald-50/40 to-transparent py-8 sm:py-14 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/90 text-[#14532d] text-xs font-extrabold tracking-wide border border-emerald-300/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>১০০% প্রাকৃতিকভাবে উৎপাদিত ও কাঠের ঘানিতে প্রস্তুত</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
              {headline}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3.5 bg-[#14532d] hover:bg-[#166534] active:scale-98 text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>পণ্য কিনুন (Shop Now)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('offers')}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>স্পেশাল অফার দেখুন</span>
              </button>
            </div>

            {/* Trust Badges under CTA */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>সারা দেশে হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>১০০% খাঁটি পণ্যের নিশ্চয়তা</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={heroImg}
                alt="Barakah Agro Farm"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/barakah/sorisa5liter.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs font-bold text-emerald-300">ঐতিহ্যের কাঠের ঘানি</div>
                <div className="text-base sm:text-lg font-black">
                  খাঁটি সরিষার তেল ও সুন্দরবনের আসল মধু
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl shadow-xl border border-slate-200 hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#14532d] flex items-center justify-center font-black text-base">
                ৳
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">ফ্রি ডেলিভারি অফার</div>
                <div className="text-[11px] text-emerald-700 font-semibold">২০০০ টাকার অর্ডারে</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. FEATURED CATEGORIES
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              জনপ্রিয় ক্যাটাগরি (Top Categories)
            </h2>
            <p className="text-xs text-slate-500">আপনার প্রয়োজনীয় পণ্যটি বেছে নিন</p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#14532d] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden mb-2.5 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {cat.banglaName || cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5">{cat.itemCount} টি পণ্য</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          3. FLASH SALE / HOT OFFERS SECTION
          ========================================== */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 rounded-3xl p-5 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-extrabold mb-2">
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>লিমিটেড টাইম অফার</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  ফ্ল্যাশ সেল ও বিশেষ ছাড় (Flash Sale)
                </h2>
                <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                  সীমিত সময়ের জন্য বিশেষ মূল্যে পছন্দের খাঁটি পণ্য সংগ্রহ করুন
                </p>
              </div>

              {/* Countdown Clock */}
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <span className="bg-white/20 px-2 py-1 rounded tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span>:</span>
                  <span className="bg-white/20 px-2 py-1 rounded tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span>:</span>
                  <span className="bg-white/20 px-2 py-1 rounded tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Offer Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSaleProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetails={onOpenProductDetails}
                  onInstantBuy={onInstantBuy}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          4. TOP SELLING PRODUCTS
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              সর্বাধিক বিক্রিত পণ্য (Top Selling Products)
            </h2>
            <p className="text-xs text-slate-500">গ্রাহকদের সবচেয়ে পছন্দের খাঁটি খাদ্যতালিকা</p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#14532d] hover:underline flex items-center gap-1"
          >
            <span>আরও দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenDetails={onOpenProductDetails}
              onInstantBuy={onInstantBuy}
            />
          ))}
        </div>
      </section>

      {/* ==========================================
          5. BRAND STORY & PLEDGE BANNER
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#14532d] rounded-3xl p-6 sm:p-10 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-lg">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
              আমাদের মূল দর্শন ও সততা
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-snug">
              খাবারে কোনো ভেজাল নয়, সুস্থ জীবনযাপনে খাঁটি খাবারের নিশ্চয়তা
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
              আজকের বাজারে কেমিক্যাল, প্রিজারভেটিভ ও ভেজালের ভিড়ে পরিবারকে নিরাপদ রাখতে বারাকাহ এগ্রোর জন্ম। আমরা কাঠের ঘানির সরিষার তেল, সুন্দরবনের প্রাকৃতিক বুনো মধু এবং প্রাকৃতিক ভেষজ শুকনো পাতা সরাসরি উৎপাদনস্থল থেকে স্বাস্থ্যসম্মত উপায়ে সংগ্রহ ও বাজারজাত করে থাকি।
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 bg-white/10 rounded-xl border border-white/15">
                <div className="font-extrabold text-white text-sm">১০০% অর্গানিক</div>
                <div className="text-emerald-200 text-[11px]">কোনো ক্ষতিকর প্রিজারভেটিভ নেই</div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15">
                <div className="font-extrabold text-white text-sm">কাঠের ঘানি</div>
                <div className="text-emerald-200 text-[11px]">সনাতন কোল্ড প্রেসড পদ্ধতি</div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15">
                <div className="font-extrabold text-white text-sm">সততার নিশ্চয়তা</div>
                <div className="text-emerald-200 text-[11px]">পণ্য দেখে নেওয়ার সুবিধা</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white/10 rounded-2xl border border-white/20">
            <img
              src="/images/barakah/logo.jpeg"
              alt="Barakah Agro"
              className="w-20 h-20 rounded-full border-2 border-emerald-400 object-cover mb-3"
            />
            <div className="text-base font-extrabold text-white">BARAKAH AGRO</div>
            <div className="text-xs text-emerald-300 font-medium mb-4">
              বিশুদ্ধ খাবার, সুস্থ জীবনের জন্য
            </div>
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>সরাসরি কল করুন ({hotline})</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. NEW ARRIVALS & SUPERFOODS
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              নতুন আগমন (New Arrivals & Superfoods)
            </h2>
            <p className="text-xs text-slate-500">তাজা ও পুষ্টিকর নতুন পণ্যসমূহ</p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#14532d] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenDetails={onOpenProductDetails}
              onInstantBuy={onInstantBuy}
            />
          ))}
        </div>
      </section>

      {/* ==========================================
          7. WHY CHOOSE BARAKAH AGRO
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            কেন বারাকাহ এগ্রো বেছে নেবেন?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            আমরা শুধুমাত্র পণ্য বিক্রি করি না, পরিবারকে সুস্থ রাখার দায়িত্ব গ্রহণ করি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">১০০% প্রাকৃতিক ও নির্ভেজাল</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              কোনো ক্ষতিকর রাসায়নিক উপাদান, আর্টিফিশিয়াল রঙ বা পাম অয়েল মেশানো হয় না।
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">কাঠের ঘানির কোল্ড-প্রেসড</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              সনাতন কাঠের ঘানিতে তাপমাত্রা না বাড়িয়ে নিষ্কাশন করায় প্রাকৃতিক পুষ্টি অক্ষত থাকে।
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">সারা দেশে দ্রুত ডেলিভারি</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৩ কার্যদিবসে ক্যাশ অন ডেলিভারি।
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">দেখে নেওয়ার রিটার্ন গ্যারান্টি</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ডেলিভারি রাইডারের সামনে পার্সেল দেখে পছন্দ না হলে সরাসরি ফেরত দেওয়ার সুবিধা।
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          8. CUSTOMER REVIEWS & TESTIMONIALS
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#14532d] text-xs font-extrabold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>সন্তুষ্ট গ্রাহকদের ভালোবাসা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            গ্রাহকদের বাস্তব অভিজ্ঞতা ও রিভিউ
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            আমাদের নিয়মিত ক্রেতারা বারাকাহ এগ্রো সম্পর্কে যা বলছেন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 italic">
                  "{rev.comment}"
                </p>

                {rev.productName && (
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-4">
                    ক্রয়কৃত পণ্য: {rev.productName}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                {rev.image ? (
                  <img
                    src={rev.image}
                    alt={rev.author}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {rev.author.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900">{rev.author}</div>
                  <div className="text-[11px] text-slate-400">{rev.city} · {rev.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          9. DIRECT WHATSAPP & HOTLINE BANNER
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-800 to-[#14532d] rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              অনলাইনে অর্ডার করতে সমস্যা হচ্ছে?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
              আমাদের হটলাইনে সরাসরি কল করে অথবা হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে যেকোনো সময় অর্ডার কনফার্ম করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              className="px-5 py-3 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>কল করুন: {hotline}</span>
            </a>

            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                'আসসালামু আলাইকুম! বারাকাহ এগ্রো থেকে অর্ডার করতে চাই।'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-500 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপ মেসেজ</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==========================================
          10. NEWSLETTER
          ========================================== */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h3 className="text-xl font-black text-slate-900">
          নতুন অফার ও স্বাস্থ্য টিপসের জন্য যুক্ত থাকুন
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          আমাদের সাপ্তাহিক নতুন স্টক আগমন ও বিশেষ মূল্যছাড়ের আপডেট জানতে আপনার ইমেইল বা ফোন নম্বর দিন।
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('ধন্যবাদ! বারাকাহ এগ্রো নিউজলিস্টে যুক্ত হয়েছেন।');
          }}
          className="flex max-w-md mx-auto gap-2"
        >
          <input
            type="text"
            required
            placeholder="আপনার মোবাইল নম্বর বা ইমেইল লিখুন"
            className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600 shadow-2xs"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            সাবস্ক্রাইব
          </button>
        </form>
      </section>
    </div>
  );
};
