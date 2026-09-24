import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingCart,
  Zap,
  Heart,
  MessageCircle,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { submitReview } from '../services/api';
import type { Product, ProductVariant, SiteReview } from '../types/ecommerce';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantBuy: (product: Product, variant: ProductVariant, quantity: number) => void;
  onSelectRelated: (product: Product) => void;
  allProducts: Product[];
  reviews: SiteReview[];
  onReviewSubmitted: (rev: SiteReview) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantBuy,
  onSelectRelated,
  allProducts,
  reviews,
  onReviewSubmitted,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'benefits' | 'shipping' | 'reviews'>('desc');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review form state
  const [authorName, setAuthorName] = useState('');
  const [authorCity, setAuthorCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const packages = product.packages && product.packages.length > 0
    ? product.packages
    : [{ id: 'p-def', label: '১ একক', price: product.price, oldPrice: product.oldPrice, stock: product.stock }];

  const currentVariant = packages[selectedVariantIndex] || packages[0];
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const currentImage = images[activeImageIndex] || product.image;
  const isWishlisted = isInWishlist(product.id);

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      banglaName: product.banglaName,
      image: product.image,
      packageLabel: currentVariant.label,
      price: currentVariant.price,
      quantity,
      stock: currentVariant.stock || product.stock,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNow = () => {
    onInstantBuy(product, currentVariant, quantity);
  };

  const handleWhatsAppOrder = () => {
    const text = `আসসালামু আলাইকুম! বারাকাহ এগ্রো থেকে আমি অর্ডার করতে চাই:\n\n*পণ্য:* ${product.banglaName || product.name}\n*প্যাকেজ:* ${currentVariant.label}\n*পরিমাণ:* ${quantity}টি\n*মূল্য:* ৳${currentVariant.price * quantity}\n\nদয়া করে ডেলিভারি কনফার্ম করবেন।`;
    window.open(`https://wa.me/8801786239185?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const newRev = await submitReview({
        author: authorName.trim(),
        city: authorCity.trim() || 'ঢাকা',
        rating: reviewRating,
        comment: reviewComment.trim(),
        productName: product.banglaName || product.name,
      });
      onReviewSubmitted(newRev);
      setReviewSuccess(true);
      setAuthorName('');
      setAuthorCity('');
      setReviewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Left: Images Column */}
            <div className="md:col-span-6 flex flex-col">
              {/* Main Image */}
              <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center p-4">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
                {product.badges && product.badges.length > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 rounded-md shadow-xs">
                    {product.badges[0]}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-rose-600"
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-lg border-2 overflow-hidden bg-slate-50 p-1 flex-shrink-0 transition-colors ${
                        activeImageIndex === idx ? 'border-emerald-600' : 'border-slate-200'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges under Image */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>১০০% খাঁটি ও প্রাকৃতিক</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>সমগ্র বাংলাদেশে ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>কাঠের ঘানিতে প্রস্তুত</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>সহজ রিটার্ন নিশ্চয়তা</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Purchase Controls */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                {/* Category & SKU */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-medium text-emerald-700">{product.category}</span>
                  <span>SKU: {product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {product.banglaName || product.name}
                </h1>
                {product.banglaName && (
                  <div className="text-xs text-slate-500 mt-0.5">{product.name}</div>
                )}

                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({product.reviewCount} রিভিউ)</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    স্টকে আছে ({product.stock} টি অবশিষ্ট)
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-baseline gap-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    ৳ {currentVariant.price}
                  </div>
                  {currentVariant.oldPrice && currentVariant.oldPrice > currentVariant.price && (
                    <div className="text-sm sm:text-base text-slate-400 line-through tabular-nums">
                      ৳ {currentVariant.oldPrice}
                    </div>
                  )}
                  {currentVariant.discount && (
                    <span className="ml-auto text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {currentVariant.discount}
                    </span>
                  )}
                </div>

                {/* Package Variants Selection */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    প্যাকেজ / সাইজ নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {packages.map((pkg, idx) => (
                      <button
                        key={pkg.id || idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                          selectedVariantIndex === idx
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>{pkg.label}</div>
                        <div className="text-[11px] font-bold text-emerald-700 mt-0.5">৳ {pkg.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-800">পরিমাণ (Quantity):</label>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-9 text-slate-600 hover:text-slate-900 font-bold flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-9 text-slate-600 hover:text-slate-900 font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                        addedAnimation
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#14532d] hover:bg-[#166534] text-white active:scale-98'
                      }`}
                    >
                      {addedAnimation ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>কার্টে যুক্ত হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>কার্টে যোগ করুন</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>অর্ডার করুন (Buy Now)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>হোয়াটসঅ্যাপের মাধ্যমে সরাসরি অর্ডার করুন (০১৭৮৬-২৩৯১৮৫)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs: Description, Benefits, Shipping, Reviews */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'desc'
                    ? 'bg-[#14532d] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                পণ্য বিবরণ (Description)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('benefits')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'benefits'
                    ? 'bg-[#14532d] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                উপকারিতা (Health Benefits)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'shipping'
                    ? 'bg-[#14532d] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ডেলিভারি ও রিটার্ন (Shipping)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'bg-[#14532d] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                গ্রাহক মতামত ({reviews.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeTab === 'desc' && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  {product.ingredients && (
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-950">উপাদান ও বিশুদ্ধতা: </span>
                      <span className="text-emerald-900">{product.ingredients}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'benefits' && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 mb-2">
                    কেন বারাকাহ এগ্রোর {product.banglaName || product.name} গ্রহণ করবেন?
                  </div>
                  {product.benefits && product.benefits.length > 0 ? (
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>শতভাগ প্রাকৃতিক উপাদানে প্রস্তুত, কৃত্রিম ফ্লেভার বা কেমিক্যাল মুক্ত।</p>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>ঢাকার ভেতরে ডেলিভারি</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        চার্জ ৳৮০ | সময়: ২৪ থেকে ৪৮ ঘণ্টা। ক্যাশ অন ডেলিভারি প্রযোজ্য।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>ঢাকার বাইরে ডেলিভারি</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        চার্জ ৳১৩০ | সময়: ২ থেকে ৩ কার্যদিবস।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950">
                    <strong>রিটার্ন পলিসি:</strong> পার্সেল রিসিভ করার সময় ডেলিভারি রাইডারের সামনে দেখে পণ্য গ্রহণ করার সুযোগ রয়েছে। পণ্যে কোনো ত্রুটি থাকলে সরাসরি ফেরত দেওয়া যাবে।
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews.slice(0, 4).map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-slate-900 text-xs">{rev.author}</div>
                          <div className="flex items-center text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500 mb-1.5">{rev.city} · {rev.date}</div>
                        <p className="text-xs text-slate-700">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Submit Review Form */}
                  <form onSubmit={handleReviewSubmit} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">আপনার মূল্যবান মতামত দিন</h4>
                    {reviewSuccess && (
                      <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold">
                        ধন্যবাদ! আপনার রিভিউ সফলভাবে যুক্ত হয়েছে।
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="আপনার নাম *"
                        required
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                      />
                      <input
                        type="text"
                        value={authorCity}
                        onChange={(e) => setAuthorCity(e.target.value)}
                        placeholder="আপনার শহর / এলাকা (যেমন: ঢাকা)"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">রেটিং:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            className="p-1"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                s <= reviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="পণ্য সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      {isSubmittingReview ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Recommendation */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-3">
                সম্পর্কিত অন্যান্য পণ্যসমূহ (Related Products)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectRelated(rel);
                      setSelectedVariantIndex(0);
                      setActiveImageIndex(0);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-12 h-12 object-contain rounded-md bg-slate-50"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {rel.banglaName || rel.name}
                      </div>
                      <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                        ৳ {rel.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
