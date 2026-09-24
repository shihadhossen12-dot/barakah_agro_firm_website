import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Tag,
  Phone,
  MessageCircle,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../services/api';
import type { Order } from '../types/ecommerce';

interface CheckoutPageProps {
  onBackToShopping: () => void;
  onOrderCompleted: (order: Order) => void;
}

const BD_DIVISIONS = [
  'Dhaka (ঢাকা)',
  'Chittagong (চট্টগ্রাম)',
  'Rajshahi (রাজশাহী)',
  'Khulna (খুলনা)',
  'Barisal (বরিশাল)',
  'Sylhet (সিলেট)',
  'Rangpur (রংপুর)',
  'Mymensingh (ময়মনসিংহ)',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToShopping,
  onOrderCompleted,
}) => {
  const {
    cart,
    clearCart,
    subtotal,
    appliedCoupon,
    calculateShipping,
    freeShippingThreshold,
    applyCouponCode,
    couponError,
    removeCoupon,
  } = useCart();

  const { customer } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [division, setDivision] = useState(customer?.defaultDivision || 'Dhaka (ঢাকা)');
  const [district, setDistrict] = useState(customer?.defaultDistrict || 'ঢাকা');
  const [upazila, setUpazila] = useState('');
  const [address, setAddress] = useState(customer?.defaultAddress || '');
  const [deliveryLocation, setDeliveryLocation] = useState<'inside' | 'outside'>('inside');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [transactionId, setTransactionId] = useState('');

  // Coupon state in checkout
  const [couponInput, setCouponInput] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Auto-set delivery location when division changes
  useEffect(() => {
    if (division.includes('Dhaka') || district.includes('ঢাকা') || district.toLowerCase().includes('dhaka')) {
      setDeliveryLocation('inside');
    } else {
      setDeliveryLocation('outside');
    }
  }, [division, district]);

  const shippingFee = calculateShipping(deliveryLocation);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setFormError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01786239185)।');
      return;
    }

    if (!address.trim()) {
      setFormError('অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    if (paymentMethod !== 'cod' && !transactionId.trim()) {
      setFormError('মোবাইল পেমেন্টের জন্য Transaction ID (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        division,
        district,
        upazila,
        address: address.trim(),
        deliveryLocation,
        deliveryInstructions: deliveryInstructions.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.banglaName || item.name,
          packageLabel: item.packageLabel,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        shippingFee,
        total: grandTotal,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
      };

      const resultOrder = await placeOrder(orderPayload);
      clearCart();
      setCompletedOrder(resultOrder);
      onOrderCompleted(resultOrder);
    } catch (err: any) {
      setFormError(err.message || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully submitted, show the confirmation screen
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            আলহামদুলিল্লাহ! আপনার অর্ডারটি নিশ্চিত হয়েছে।
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            বারাকাহ এগ্রো বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ। খুব শীঘ্রই আমাদের কাস্টমার কেয়ার টিম আপনার সাথে যোগাযোগ করবে।
          </p>

          {/* Order Summary Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left max-w-lg mx-auto mb-6 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">অর্ডার নম্বর (Order ID):</span>
              <span className="font-extrabold text-emerald-800 tracking-wider">
                {completedOrder.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">গ্রাহকের নাম:</span>
              <span className="font-semibold text-slate-900">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">মোবাইল নম্বর:</span>
              <span className="font-semibold text-slate-900">{completedOrder.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
              <span className="font-semibold text-slate-900 max-w-[220px] text-right truncate">
                {completedOrder.address}, {completedOrder.district}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">পেমেন্ট মেথড:</span>
              <span className="font-bold text-slate-900 uppercase">
                {completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : completedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="text-emerald-800">৳ {completedOrder.total}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>রসিদ প্রিন্ট করুন</span>
            </button>

            <a
              href={`https://wa.me/8801786239185?text=${encodeURIComponent(
                `আসসালামু আলাইকুম! আমি বারাকাহ এগ্রো থেকে অর্ডার সম্পন্ন করেছি।\nঅর্ডার আইডি: ${completedOrder.id}\nসর্বমোট: ৳${completedOrder.total}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে জানান</span>
            </a>

            <button
              type="button"
              onClick={onBackToShopping}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl text-xs transition-colors"
            >
              আরও কেনাকাটা করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and not ordered
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">আপনার শপিং কার্ট খালি</h2>
        <p className="text-xs text-slate-500 mb-6">
          চেকআউট করার পূর্বে অনুগ্রহ করে পণ্য কার্টে যুক্ত করুন।
        </p>
        <button
          onClick={onBackToShopping}
          className="px-6 py-2.5 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors"
        >
          কেনাকাটা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={onBackToShopping}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>শপিংয়ে ফিরে যান</span>
      </button>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
        চেকআউট ও ডেলিভারি তথ্য (Checkout)
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Details */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                ১
              </span>
              <span>আপনার ব্যক্তিগত তথ্য</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  আপনার পূর্ণ নাম <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  মোবাইল নম্বর <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01786239185"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ইমেইল অ্যাড্রেস (ঐচ্ছিক)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Shipping Details */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                ২
              </span>
              <span>ডেলিভারি ঠিকানা ও এলাকা</span>
            </h2>

            {/* Delivery Location Toggle */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                ডেলিভারির অবস্থান নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('inside')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryLocation === 'inside'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-900">ঢাকার ভেতরে</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    চার্জ: {subtotal >= freeShippingThreshold ? 'ফ্রি!' : '৳৮০'} (২৪-৪৮ ঘণ্টা)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryLocation('outside')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryLocation === 'outside'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-900">ঢাকার বাইরে</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    চার্জ: {subtotal >= freeShippingThreshold ? 'ফ্রি!' : '৳১৩০'} (২-৩ দিন)
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  বিভাগ (Division) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                >
                  {BD_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  জেলা (District) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="যেমন: ঢাকা, গাজীপুর, চট্টগ্রাম"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  থানা / উপজেলা (Thana / Upazila)
                </label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="যেমন: মিরপুর, উত্তরা, ধানমন্ডি"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, সেক্টর/গ্রাম, ল্যান্ডমার্ক ইত্যাদি বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ডেলিভারি সংক্রান্ত নির্দেশনা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="যেমন: আসার আগে ফোন করবেন, বিকেলে ডেলিভারি দিন..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                ৩
              </span>
              <span>পেমেন্ট পদ্ধতি নির্বাচন করুন</span>
            </h2>

            <div className="space-y-3">
              {/* Cash On Delivery */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-emerald-600"
                />
                <div className="flex-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    ক্যাশ অন ডেলিভারি (Cash on Delivery)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন। কোন অগ্রিম টাকা প্রদান ছাড়াই অর্ডার নিশ্চিত করুন।
                  </div>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-1 text-emerald-600"
                />
                <div className="flex-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                    <span>বিকাশ পেমেন্ট (bKash)</span>
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-bold">
                      bKash
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    আমাদের পার্সোনাল বিকাশ নম্বরে (০১৭৮৬-২৩৯১৮৫) সেন্ড মানি করুন।
                  </div>

                  {paymentMethod === 'bkash' && (
                    <div className="mt-3 p-3 bg-pink-50/70 border border-pink-200 rounded-lg text-xs space-y-2">
                      <div className="font-bold text-pink-950">
                        বিকাশ নম্বর: <span className="font-extrabold text-pink-700">01786239185</span> (Send Money)
                      </div>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="বিকাশ Transaction ID (TrxID) লিখুন"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-pink-300 rounded-md text-xs uppercase outline-none font-mono"
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="nagad"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="mt-1 text-emerald-600"
                />
                <div className="flex-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                    <span>নগদ পেমেন্ট (Nagad)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                      Nagad
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    আমাদের নগদ পার্সোনাল নম্বরে (০১৭৮৬-২৩৯১৮৫) সেন্ড মানি করুন।
                  </div>

                  {paymentMethod === 'nagad' && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
                      <div className="font-bold text-amber-950">
                        নগদ নম্বর: <span className="font-extrabold text-amber-700">01786239185</span>
                      </div>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="নগদ Transaction ID (TrxID) লিখুন"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-md text-xs uppercase outline-none font-mono"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>অর্ডারের সারসংক্ষেপ</span>
              <span className="text-xs text-slate-500 font-normal">({cart.length}টি পণ্য)</span>
            </h3>

            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.packageLabel}`}
                  className="flex items-center gap-3 text-xs"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {item.banglaName || item.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.packageLabel} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    ৳ {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-3 border-t border-slate-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1 text-emerald-800 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>কুপন '{appliedCoupon.code}' প্রয়োগ হয়েছে (-৳{appliedCoupon.discountAmount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-rose-600 font-semibold hover:underline text-[11px]"
                  >
                    মুছুন
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="কুপন কোড লিখুন"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none uppercase font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (couponInput.trim()) {
                        applyCouponCode(couponInput.trim());
                        setCouponInput('');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    প্রয়োগ
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{couponError}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>পণ্যের উপমোট (Subtotal):</span>
                <span className="font-bold text-slate-900 tabular-nums">৳ {subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>ডিসকাউন্ট ছাড় (Coupon):</span>
                  <span className="tabular-nums">- ৳ {discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ ({deliveryLocation === 'inside' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-extrabold">ফ্রি ডেলিভারি!</span>
                  ) : (
                    `৳ ${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>সর্বমোট প্রদেয় বিল:</span>
                <span className="text-emerald-800 text-xl font-black tabular-nums">
                  ৳ {grandTotal}
                </span>
              </div>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#14532d] hover:bg-[#166534] active:scale-98 text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>অর্ডার তৈরি হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                </>
              )}
            </button>

            {/* Trust Assurances */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 space-y-1.5 text-[11px] text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>১০০% ক্যাশ অন ডেলিভারি এবং নিরাপদ লেনদেন</span>
              </div>
              <p className="text-slate-600">
                পণ্য হাতে পেয়ে সন্তুষ্ট হলে মূল্য পরিশোধ করবেন। প্রয়োজনে কল করুন: ০১৭৮৬-২৩৯১৮৫
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
