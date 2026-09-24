import React, { useState } from 'react';
import { X, Check, Printer, Clock, FileText, User, Phone, MapPin, Truck, CreditCard } from 'lucide-react';
import type { Order, OrderStatus } from '../../types/ecommerce';

interface OrderEditModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Order>) => Promise<void>;
}

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export const OrderEditModal: React.FC<OrderEditModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !order) return null;

  const [customerName, setCustomerName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.phone);
  const [address, setAddress] = useState(order.address);
  const [district, setDistrict] = useState(order.district);
  const [shippingFee, setShippingFee] = useState<number>(order.shippingFee || 80);
  const [discount, setDiscount] = useState<number>(order.discount || 0);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Failed'>(order.paymentStatus || 'Pending');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');
  const [items, setItems] = useState([...order.items]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate subtotal and total
  const calculatedSubtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal - Number(discount) + Number(shippingFee));

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...items];
    updated[index] = { ...updated[index], quantity: newQty };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave(order.id, {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        district: district.trim(),
        shippingFee: Number(shippingFee),
        discount: Number(discount),
        subtotal: calculatedSubtotal,
        total: calculatedTotal,
        items,
        status: orderStatus,
        paymentStatus,
        adminNotes: adminNotes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'অর্ডার আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">অর্ডার সম্পাদনা ও বিবরণ</h3>
              <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                {order.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              অর্ডার তারিখ: {new Date(order.createdAt).toLocaleString('bn-BD')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Print invoice"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-emerald-700" />
              ১. গ্রাহকের তথ্য (Customer Details)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">গ্রাহকের নাম</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ফোন নম্বর</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">ডেলিভারি ঠিকানা</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">জেলা / শহর</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Order Items List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Truck size={14} className="text-emerald-700" />
              ২. অর্ডারের পণ্য সমূহ (Items List)
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={it.image}
                      alt=""
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/barakah/logo.jpeg';
                      }}
                    />
                    <div>
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {it.packageLabel} | প্রতি ইউনিট: ৳{it.price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, it.quantity - 1)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-center font-bold bg-white min-w-[2rem]">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, it.quantity + 1)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-bold text-slate-900 min-w-[4rem] text-right">
                      ৳ {it.price * it.quantity}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pricing & Financials */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-700" />
              ৩. মূল্য ও ডিসকাউন্ট হিসাব (Financials)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">উপমোট (Subtotal)</span>
                <span className="font-bold text-sm text-slate-900">৳ {calculatedSubtotal}</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">ছাড় / ডিসকাউন্ট (৳)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">ডেলিভারি চার্জ (৳)</label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">সর্বমোট প্রদেয় (Total)</span>
                <span className="font-extrabold text-base text-emerald-800">৳ {calculatedTotal}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Status & Admin Notes */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-700" />
              ৪. অর্ডার স্ট্যাটাস ও অ্যাডমিন নোট (Status & Notes)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  অর্ডার স্ট্যাটাস (Order Status) *
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-emerald-600"
                >
                  {ALL_ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পেমেন্ট স্ট্যাটাস (Payment Status)
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-emerald-600"
                >
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Paid">Paid (পরিশোধিত)</option>
                  <option value="Failed">Failed (ব্যর্থ)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                অ্যাডমিন অভ্যন্তরীণ নোট (Admin Notes)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="যেমন: কাস্টমারকে ৩টায় কল দেওয়া হয়েছে, পার্সেল রেডি..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              বাতিল (Cancel)
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Check size={16} />
                  পরিবর্তন সংরক্ষণ করুন (Save Order)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
