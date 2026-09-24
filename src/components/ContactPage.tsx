import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, Check } from 'lucide-react';
import type { SiteSettings } from '../types/ecommerce';

export const ContactPage: React.FC<{ settings: SiteSettings | null }> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const hotline = settings?.hotline || '01786-239185';
  const whatsapp = settings?.whatsappNumber || '8801786239185';
  const address = settings?.address || 'House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setPhone('');
    setMsg('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          যোগাযোগ করুন (Contact Us)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          পণ্য সংক্রান্ত যেকোনো জিজ্ঞাসা বা পাইকারি ক্রয়ের জন্য আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact info cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
            <div>
              <div className="text-xs font-bold text-slate-900 mb-0.5">অফিসের ঠিকানা</div>
              <div className="text-xs text-slate-600">{address}</div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
            <div>
              <div className="text-xs font-bold text-slate-900 mb-0.5">হটলাইন নম্বর</div>
              <a href={`tel:${hotline}`} className="text-xs text-emerald-800 font-bold hover:underline">
                {hotline}
              </a>
              <div className="text-[11px] text-slate-400 mt-0.5">সকাল ৯টা থেকে রাত ১০টা</div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
            <div>
              <div className="text-xs font-bold text-slate-900 mb-0.5">হোয়াটসঅ্যাপ সাপোর্ট</div>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-800 font-bold hover:underline"
              >
                {hotline}
              </a>
              <div className="text-[11px] text-slate-400 mt-0.5">২৪ ঘণ্টা মেসেজিং সাপোর্ট</div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
            <div>
              <div className="text-xs font-bold text-slate-900 mb-0.5">ইমেইল</div>
              <div className="text-xs text-slate-600">{settings?.email || 'contact@barakahagro.com'}</div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">আমাদের সরাসরি বার্তা পাঠান</h3>

          {submitted ? (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ধন্যবাদ! আপনার বার্তা আমরা পেয়েছি। খুব শীঘ্রই যোগাযোগ করব।</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর হাসান"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01786239185"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার বার্তা *</label>
                <textarea
                  rows={4}
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="আপনার কোনো প্রশ্ন বা পরামর্শ থাকলে এখানে লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
