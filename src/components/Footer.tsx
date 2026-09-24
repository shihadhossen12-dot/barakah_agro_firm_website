import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Facebook,
  Instagram,
  ArrowRight,
} from 'lucide-react';
import type { Category, SiteSettings } from '../types/ecommerce';

interface FooterProps {
  categories: Category[];
  settings: SiteSettings | null;
  onSelectCategory: (slug: string) => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  settings,
  onSelectCategory,
  onNavigate,
}) => {
  const hotline = settings?.hotline || '01786-239185';
  const whatsapp = settings?.whatsappNumber || '8801786239185';
  const address = settings?.address || 'House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh';

  return (
    <footer className="bg-[#0f2e1b] text-slate-300 border-t border-emerald-950 mt-16">
      {/* 1. Value Proposition Features Band */}
      <div className="border-b border-emerald-900/50 bg-[#0c2617]/70 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">১০০% নির্ভেজাল খাদ্য</div>
              <div className="text-[11px] text-emerald-300/80">শতভাগ বিশুদ্ধ ও খাঁটি উপাদান</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">সমগ্র বাংলাদেশে ডেলিভারি</div>
              <div className="text-[11px] text-emerald-300/80">ক্যাশ অন ডেলিভারি সুবিধা</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">সহজ রিটার্ন পলিসি</div>
              <div className="text-[11px] text-emerald-300/80">পণ্য দেখে নেওয়ার সুযোগ</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">২৪/৭ কাস্টমার সাপোর্ট</div>
              <div className="text-[11px] text-emerald-300/80">হটলাইন: {hotline}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings?.logo || '/images/barakah/logo.jpeg'}
                alt="Barakah Agro"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <div className="text-xl font-black text-white tracking-wider">BARAKAH AGRO</div>
                <div className="text-xs text-emerald-400 font-medium">বিশুদ্ধ খাবার, সুস্থ জীবনের জন্য</div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              বারাকাহ এগ্রো বাংলাদেশের একটি নির্ভরযোগ্য অর্গানিক ও প্রাকৃতিক খাদ্য প্রস্তুতকারী প্রতিষ্ঠান। কাঠের ঘানির সরিষার তেল, সুন্দরবনের মধু, পুষ্টিকর সাজনা ও পাট পাতা এবং বাছাইকৃত স্বাস্থ্যকর খাদ্য উপাদান আমরা সরাসরি আপনাদের দোরগোড়ায় পৌঁছে দিই।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.facebookUrl || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links & Help */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">কাস্টমার সেবা</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  অর্ডার ট্র্যাক করুন
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  সকল পণ্য তালিকা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  স্পেশাল অফার
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  আমাদের গল্প ও লক্ষ্য
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  যোগাযোগ ও সাপোর্ট
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">জনপ্রিয় ক্যাটাগরি</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.slug)}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {cat.banglaName || cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Helpline */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">যোগাযোগের ঠিকানা</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হটলাইন: <a href={`tel:${hotline}`} className="hover:underline text-white font-bold">{hotline}</a></span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হোয়াটসঅ্যাপ: <a href={`https://wa.me/${whatsapp}`} className="hover:underline text-white font-bold">{hotline}</a></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings?.email || 'contact@barakahagro.com'}</span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">নিরাপদ পেমেন্ট মেথড</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded text-[10px] font-bold text-emerald-200">
                  ক্যাশ অন ডেলিভারি
                </span>
                <span className="px-2 py-1 bg-pink-950/80 border border-pink-800/60 rounded text-[10px] font-bold text-pink-300">
                  bKash
                </span>
                <span className="px-2 py-1 bg-amber-950/80 border border-amber-800/60 rounded text-[10px] font-bold text-amber-300">
                  Nagad
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Copyright Subfooter */}
      <div className="border-t border-emerald-950 bg-[#081b10] py-4 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} <strong>BARAKAH AGRO</strong>. সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="text-emerald-400 text-[11px] flex items-center gap-1">
            <span>হালাল ও বিশুদ্ধ খাদ্যের নির্ভরযোগ্য ঠিকানা</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
