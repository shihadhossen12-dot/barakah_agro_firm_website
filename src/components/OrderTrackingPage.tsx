import React, { useState } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { trackOrder } from '../services/api';
import type { Order, OrderStatus } from '../types/ecommerce';

const ORDER_STEPS: { status: OrderStatus; label: string; banglaLabel: string }[] = [
  { status: 'Pending', label: 'Order Placed', banglaLabel: 'অর্ডার গৃহীত হয়েছে' },
  { status: 'Confirmed', label: 'Confirmed', banglaLabel: 'কনফার্মেশন সম্পন্ন' },
  { status: 'Processing', label: 'Processing', banglaLabel: 'পণ্য প্রস্তুতকরণ' },
  { status: 'Packed', label: 'Packed', banglaLabel: 'প্যাকেজিং সমাপ্ত' },
  { status: 'Shipped', label: 'Shipped', banglaLabel: 'কুরিয়ারে হস্তান্তর' },
  { status: 'Out for Delivery', label: 'Out for Delivery', banglaLabel: 'ডেলিভারিতে চলমান' },
  { status: 'Delivered', label: 'Delivered', banglaLabel: 'সফলভাবে ডেলিভার্ড' },
];

export const OrderTrackingPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('অর্ডার নম্বর এবং মোবাইল নম্বর উভয়ই লিখুন।');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await trackOrder(orderId.trim(), phone.trim());
      setOrder(res);
    } catch (err: any) {
      setError(err.message || 'অর্ডারটি খুঁজে পাওয়া যায়নি। নম্বর দুটি যাচাই করুন।');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          অর্ডার ট্র্যাকিং (Track Your Order)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          আপনার অর্ডার নম্বর (যেমন: BA-2026-000101) এবং অর্ডারে ব্যবহৃত মোবাইল নম্বর দিয়ে লাইভ স্ট্যাটাস দেখুন।
        </p>
      </div>

      {/* Tracking Search Form */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm mb-8 max-w-2xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                অর্ডার নম্বর (Order ID)
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="যেমন: BA-2026-000101"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none uppercase font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                মোবাইল নম্বর (Phone)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: 01712345678"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#14532d] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>অনুসন্ধান করা হচ্ছে...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>অর্ডার খুঁজুন (Track Now)</span>
              </>
            )}
          </button>
        </form>

        {/* Quick test prompt for convenience */}
        <div className="mt-3 pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400">
            ডেমো অর্ডারের জন্য ব্যবহার করুন: ID: <strong className="text-slate-600">BA-2026-000101</strong> | Phone: <strong className="text-slate-600">01712345678</strong>
          </span>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Tracking Timeline & Details */}
      {order && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in">
          {/* Status Top Banner */}
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  অর্ডার: {order.id}
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  অর্ডার তারিখ:{' '}
                  {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/8801786239185?text=${encodeURIComponent(
                `আসসালামু আলাইকুম! আমার অর্ডার আইডি ${order.id} সম্পর্কে জানতে চাচ্ছি।`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>সরাসরি হেল্পলাইনে যোগাযোগ</span>
            </a>
          </div>

          {/* Stepper Progression */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIdx / (ORDER_STEPS.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.status}
                      className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative z-10"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <div
                          className={`text-xs font-bold ${
                            isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.banglaLabel}
                        </div>
                        <div className="text-[10px] text-slate-400 hidden sm:block">
                          {step.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery & Customer Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ডেলিভারি ও গ্রাহক তথ্য
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">গ্রাহক:</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ফোন:</span>
                  <span className="font-semibold text-slate-900">{order.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ঠিকানা:</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[200px]">
                    {order.address}, {order.district}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-emerald-800 text-sm">৳ {order.total}</span>
                </div>
              </div>

              {/* Status History Timeline */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    টাইমলাইন হিস্টোরি
                  </h4>
                  <div className="space-y-2">
                    {order.statusHistory.map((item, i) => (
                      <div
                        key={i}
                        className="text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 flex items-start gap-2"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold text-slate-900">{item.status}: </span>
                          <span className="text-slate-600">{item.note}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(item.timestamp).toLocaleString('bn-BD')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ordered Products Items */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                অর্ডারকৃত পণ্য তালিকা
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.packageLabel} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      ৳ {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
