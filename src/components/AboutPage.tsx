import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake, Truck, MapPin, Phone, Mail } from 'lucide-react';
import type { SiteSettings } from '../types/ecommerce';

export const AboutPage: React.FC<{ settings: SiteSettings | null }> = ({ settings }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          আমাদের গল্প ও পথচলা
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বারাকাহ এগ্রো (Barakah Agro)
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          "বিশুদ্ধ খাবার, সুস্থ জীবনের জন্য" — এই মূলমন্ত্রকে ধারণ করে আমাদের যাত্রা শুরু।
        </p>
      </div>

      {/* Main Story */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <p>
          বর্তমান সময়ে বাজারে প্রক্রিয়াজাত ও কেমিক্যালযুক্ত ভেজাল খাদ্যের ভিড়ে নিজের ও পরিবারের জন্য শতভাগ বিশুদ্ধ খাবার খুঁজে পাওয়া একটি বড় চ্যালেঞ্জ। এই প্রয়োজন থেকেই বারাকাহ এগ্রোর জন্ম।
        </p>
        <p>
          আমরা বিশ্বাস করি, সুস্থ ও নিরোগ জীবনের প্রধান শর্ত হলো প্রতিদিনের বিশুদ্ধ আহার। এজন্য আমরা প্রাচীন সনাতন কাঠের ঘানিতে কোনো প্রকার কৃত্রিম তাপ ছাড়াই মাঘী সরিষা থেকে তেল উৎপাদন করি। এতে সরিষার আসল ঝাঁঝ, অ্যান্টিঅক্সিডেন্ট ও পুষ্টি উপাদান সম্পূর্ণ অটুট থাকে।
        </p>
        <p>
          পাশাপাশি সুন্দরবনের ঐতিহ্যবাহী মৌয়ালদের মাধ্যমে সরাসরি বুনো চাক থেকে সংগ্রহ করা খাঁটি মধু, গ্রাম থেকে সরাসরি সংগৃহীত দেশি গাভীর দুধের ঘি এবং পুষ্টিগুণে ভরপুর শুকনো সাজনা ও পাট পাতা আমরা স্বাস্থ্যসম্মত প্যাকেজিংয়ে আপনাদের হাতে পৌঁছে দিই।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="text-2xl font-black text-emerald-800 mb-1">১০০%</div>
            <div className="text-xs font-bold text-slate-900">প্রাকৃতিক উপাদান</div>
            <div className="text-[11px] text-slate-500">কোনো প্রিজারভেটিভ নেই</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="text-2xl font-black text-emerald-800 mb-1">৬৪ জেলা</div>
            <div className="text-xs font-bold text-slate-900">হোম ডেলিভারি</div>
            <div className="text-[11px] text-slate-500">ক্যাশ অন ডেলিভারি সুবিধা</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="text-2xl font-black text-emerald-800 mb-1">১০০০+</div>
            <div className="text-xs font-bold text-slate-900">সন্তুষ্ট পরিবার</div>
            <div className="text-[11px] text-slate-500">বিশ্বস্ততার সাথে সেবা</div>
          </div>
        </div>
      </div>
    </div>
  );
};
