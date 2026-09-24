import React, { useState } from 'react';
import { X, Lock, Phone, User, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAdmin?: boolean;
  onAdminSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultAdmin = false,
  onAdminSuccess,
}) => {
  const { customer, loginCustomer, logoutCustomer, loginAdmin, isAdmin, logoutAdmin } = useAuth();

  const [mode, setMode] = useState<'customer' | 'admin'>(defaultAdmin ? 'admin' : 'customer');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;
    await loginCustomer(phoneOrEmail.trim(), customerName.trim());
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = loginAdmin(adminPassword);
    if (success) {
      if (onAdminSuccess) onAdminSuccess();
      onClose();
    } else {
      setError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক অ্যাডমিন পাসওয়ার্ড প্রদান করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header & Mode Switch */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode('customer');
                setError(null);
              }}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                mode === 'customer'
                  ? 'bg-[#14532d] text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              গ্রাহক লগইন
            </button>
            <button
              onClick={() => {
                setMode('admin');
                setError(null);
              }}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                mode === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              অ্যাডমিন পোর্টাল
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Login Form */}
        {mode === 'customer' ? (
          <div>
            {customer ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{customer.name}</h3>
                  <div className="text-xs text-slate-500">{customer.phone || customer.email}</div>
                </div>
                <button
                  onClick={() => {
                    logoutCustomer();
                    onClose();
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                >
                  লগআউট করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomerLogin} className="space-y-3">
                <div className="text-center mb-2">
                  <h3 className="font-extrabold text-sm text-slate-900">লগইন বা অ্যাকাউন্ট তৈরি</h3>
                  <p className="text-[11px] text-slate-500">আপনার মোবাইল নম্বর বা ইমেইল দিয়ে সহজে লগইন করুন</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    মোবাইল নম্বর বা ইমেইল
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="017XXXXXXXX বা user@mail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    আপনার নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: তানভীর হাসান"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#14532d] hover:bg-[#166534] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  লগইন করুন / চালিয়ে যান
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Admin Login Form */
          <div>
            {isAdmin ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  অ্যাডমিন হিসেবে লগইন আছেন
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onAdminSuccess) onAdminSuccess();
                      onClose();
                    }}
                    className="flex-1 py-2 bg-[#14532d] text-white text-xs font-bold rounded-xl"
                  >
                    ড্যাশবোর্ডে প্রবেশ
                  </button>
                  <button
                    onClick={logoutAdmin}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    লগআউট
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div className="text-center mb-2">
                  <h3 className="font-extrabold text-sm text-slate-900">অ্যাডমিন পাসওয়ার্ড</h3>
                  <p className="text-[11px] text-slate-500">অর্ডার ও প্রোডাক্ট নিয়ন্ত্রণের জন্য প্রবেশ করুন</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    পাসওয়ার্ড (PIN)
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড দিন..."
                      className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      aria-label={showAdminPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-[11px] text-rose-600 font-semibold">{error}</div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  প্রবেশ করুন (Enter Admin)
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
