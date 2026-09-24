import React, { useState } from 'react';
import { X, Check, Image, Sparkles } from 'lucide-react';
import type { Category } from '../../types/ecommerce';

interface CategoryModalProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: Partial<Category>) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name || '');
  const [banglaName, setBanglaName] = useState(category?.banglaName || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [image, setImage] = useState(category?.image || '/images/barakah/sorisa5liter.png');
  const [description, setDescription] = useState(
    category?.description || 'শতভাগ খাঁটি ও পুষ্টিকর প্রাকৃতিক খাবার।'
  );
  const [isActive, setIsActive] = useState(category ? category.isActive !== false : true);
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder || 1);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ক্যাটাগরির ইংরেজি নাম আবশ্যক!');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        banglaName: banglaName.trim() || name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image: image.trim(),
        description: description.trim(),
        isActive,
        displayOrder: Number(displayOrder),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'ক্যাটাগরি সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-emerald-600" />
            {isEdit ? 'ক্যাটাগরি সম্পাদনা (Edit Category)' : 'নতুন ক্যাটাগরি তৈরি করুন'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              ক্যাটাগরি নাম (English Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Mustard Oil"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              বাংলা নাম (Bangla Name) *
            </label>
            <input
              type="text"
              required
              value={banglaName}
              onChange={(e) => setBanglaName(e.target.value)}
              placeholder="যেমন: সরিষার তেল"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-[11px]"
              />
              <div className="w-9 h-9 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 p-0.5">
                <img src={image} alt="" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">বিবরণ</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-slate-800">অ্যাক্টিভ (Active)</span>
            </label>

            <div className="flex items-center gap-1">
              <span className="text-slate-500">ক্রম:</span>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
