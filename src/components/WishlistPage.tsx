import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/ecommerce';

interface WishlistPageProps {
  products: Product[];
  onOpenProductDetails: (product: Product) => void;
  onNavigate: (view: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  products,
  onOpenProductDetails,
  onNavigate,
}) => {
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">আপনার উইশলিস্ট খালি</h2>
        <p className="text-xs text-slate-500">
          আপনার পছন্দের প্রাকৃতিক ও খাঁটি পণ্যগুলো সহজেই খুঁজে পেতে হৃদয়ে ক্লিক করে উইশলিস্টে যুক্ত করুন।
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors"
        >
          পণ্য দেখুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">পছন্দের পণ্য তালিকা (Wishlist)</h1>
          <p className="text-xs text-slate-500">মোট {wishlistedProducts.length}টি সংরক্ষিত পণ্য</p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>সবগুলো মুছুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlistedProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-3 flex items-center justify-center">
                <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                <button
                  onClick={() => removeFromWishlist(prod.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-rose-600 hover:bg-rose-50"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-semibold text-emerald-800 mb-0.5">{prod.category}</div>
              <h3
                onClick={() => onOpenProductDetails(prod)}
                className="font-bold text-sm text-slate-900 line-clamp-1 cursor-pointer hover:text-emerald-700"
              >
                {prod.banglaName || prod.name}
              </h3>

              <div className="text-base font-black text-slate-900 mt-2">৳ {prod.price}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  addToCart({
                    productId: prod.id,
                    name: prod.name,
                    banglaName: prod.banglaName,
                    image: prod.image,
                    packageLabel: prod.packages?.[0]?.label || '১ একক',
                    price: prod.price,
                    quantity: 1,
                    stock: prod.stock,
                  });
                }}
                className="flex-1 py-2 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                onClick={() => onOpenProductDetails(prod)}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600"
                title="View details"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
