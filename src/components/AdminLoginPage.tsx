import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToStore }) => {
  const { loginAdminWithCredentials, isAdmin, adminUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdminWithCredentials(email, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড! সঠিক তথ্য প্রদান করুন।');
      }
    } catch (err: any) {
      setError(err?.message || 'লগইন প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 backdrop-blur-sm"
        >
          <ArrowLeft size={14} />
          স্টোরফ্রন্টে ফিরে যান
        </button>

        <span className="text-[11px] text-emerald-400 font-mono tracking-wider bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
          SECURE ADMIN PORTAL
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/80 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#14532d] text-white shadow-lg shadow-emerald-900/40 mb-4 ring-4 ring-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            বারাকাহ এগ্রো অ্যাডমিন
          </h1>
          <p className="text-xs text-slate-400">
            Barakah Agro Web Administration & Store Management
          </p>
        </div>

        {isAdmin ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">আপনি ইতোমধ্যে অ্যাডমিন হিসেবে লগইন আছেন</p>
              <p className="text-xs text-slate-400 mt-1">{adminUser?.email || 'Administrator'}</p>
            </div>
            <button
              onClick={onSuccess}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                অ্যাডমিন ইমেইল (Email Address)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@barakahagro.com"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                অ্যাডমিন পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড প্রদান করুন..."
                  className="w-full pl-10 pr-10 py-3 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-[#14532d] hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                'লগইন করুন (Secure Login)'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            শুধুমাত্র বারাকাহ এগ্রোর অনুমোদিত অ্যাডমিন এই প্যানেল পরিচালনা করতে পারবেন। সাধারণ গ্রাহকগণের প্রবেশাধিকার সংরক্ষিত।
          </p>
        </div>
      </div>
    </div>
  );
};
