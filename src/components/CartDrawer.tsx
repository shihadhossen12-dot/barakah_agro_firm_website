import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Tag,
  Check,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onCheckout,
  onContinueShopping,
}) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    isDrawerOpen,
    setIsDrawerOpen,
    appliedCoupon,
    couponError,
    applyCouponCode,
    removeCoupon,
    freeShippingThreshold,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isDrawerOpen) return null;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplyingCoupon(true);
    await applyCouponCode(inputCoupon.trim());
    setIsApplyingCoupon(false);
    setInputCoupon('');
  };

  const handleWhatsAppCartOrder = () => {
    if (cart.length === 0) return;
    const itemsText = cart
      .map(
        (item) =>
          `• ${item.banglaName || item.name} (${item.packageLabel}) x ${item.quantity} = ৳${
            item.price * item.quantity
          }`
      )
      .join('\n');

    const msg = `🛒 *অর্ডার রিকোয়েস্ট - বারাকাহ এগ্রো*\n\nপণ্য তালিকা:\n${itemsText}\n\nউপমোট: ৳${subtotal}\n\nআমার ঠিকানা ও ডেলিভারি বিস্তারিত পাঠাতে চাচ্ছি।`;
    const url = `https://wa.me/8801786239185?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#14532d]" />
              <h2 className="text-base font-bold text-slate-900">
                শপিং কার্ট ({totalItems}টি পণ্য)
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 text-xs">
            {neededForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-emerald-900 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    আরও <strong>৳{neededForFreeShipping}</strong> টাকার কেনাকাটায় ফ্রি ডেলিভারি!
                  </span>
                  <span className="font-bold">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                অভিনন্দন! আপনি ফ্রি ডেলিভারি উপভোগ করছেন।
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  আপনার কার্ট বর্তমানে খালি
                </h3>
                <p className="text-xs text-slate-500 mb-5 max-w-xs">
                  আমাদের খাঁটি সরিষার তেল, প্রাকৃতিক মধু কিংবা শুকনো সাজনা পাতা আপনার কার্টে যোগ করুন।
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onContinueShopping();
                  }}
                  className="px-5 py-2.5 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.packageLabel}`}
                  className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-lg bg-white border border-slate-200/60 p-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {item.banglaName || item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId, item.packageLabel)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      প্যাকেজ: <span className="text-emerald-800 font-semibold">{item.packageLabel}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center border border-slate-300 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.packageLabel, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-slate-800 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.packageLabel, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        ৳ {item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Actions */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-slate-200 space-y-3">
              {/* Coupon input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code} কুপন যুক্ত হয়েছে (-৳{appliedCoupon.discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-rose-600 font-semibold text-[11px]"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="কুপন কোড (যেমন: BARAKAH10)"
                      className="flex-1 px-3 py-1.5 text-xs uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {isApplyingCoupon ? '...' : 'প্রয়োগ'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{couponError}</p>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>পণ্যের উপমোট (Subtotal):</span>
                  <span className="font-semibold text-slate-900 tabular-nums">৳ {subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>কুপন ছাড় (Discount):</span>
                    <span className="font-bold tabular-nums">- ৳ {discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>হোম ডেলিভারি চার্জ:</span>
                  <span className="text-slate-500 italic">
                    {subtotal >= freeShippingThreshold ? 'ফ্রি ডেলিভারি!' : 'চেকআউটে নির্ধারিত'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>সর্বমোট প্রদেয় (Est. Total):</span>
                  <span className="text-emerald-800 text-base font-extrabold tabular-nums">
                    ৳ {Math.max(0, subtotal - discountAmount)}
                  </span>
                </div>
              </div>

              {/* Main Checkout Button */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onCheckout();
                }}
                className="w-full py-3 px-4 bg-[#14532d] hover:bg-[#166534] active:scale-98 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান (Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* WhatsApp Quick Order Option */}
              <button
                type="button"
                onClick={handleWhatsAppCartOrder}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
