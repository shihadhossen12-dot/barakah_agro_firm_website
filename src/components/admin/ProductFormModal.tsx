import React, { useState } from 'react';
import { X, Plus, Trash2, Image, Layers, Tag, DollarSign, Package2, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { Product, Category, ProductVariant } from '../../types/ecommerce';

interface ProductFormModalProps {
  product?: Product | null; // If null, mode is Add; otherwise mode is Edit
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(product);

  // Form fields
  const [name, setName] = useState(product?.name || '');
  const [banglaName, setBanglaName] = useState(product?.banglaName || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [category, setCategory] = useState(product?.category || categories[0]?.name || 'Mustard Oil');
  const [brand, setBrand] = useState(product?.brand || 'Barakah Agro');
  const [sku, setSku] = useState(product?.sku || `BA-${Math.floor(1000 + Math.random() * 9000)}`);
  const [price, setPrice] = useState<number>(product?.price || 250);
  const [oldPrice, setOldPrice] = useState<number | string>(product?.oldPrice || '');
  const [stock, setStock] = useState<number>(product?.stock !== undefined ? product.stock : 50);
  const [weight, setWeight] = useState(product?.weight || '500g');
  const [unit, setUnit] = useState(product?.unit || 'বোতল / বোতলজাত');
  const [image, setImage] = useState(product?.image || '/images/barakah/sorisa5liter.png');
  const [galleryText, setGalleryText] = useState((product?.gallery || []).join('\n'));
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || 'শতভাগ খাঁটি ও প্রাকৃতিক পণ্য।');
  const [description, setDescription] = useState(
    product?.description || 'বারাকাহ এগ্রোর স্বাস্থ্যসম্মত ও পুষ্টিকর খাদ্যপণ্য।'
  );
  const [ingredients, setIngredients] = useState(product?.ingredients || '১০০% খাঁটি ও প্রাকৃতিক উপাদান');
  const [tagsText, setTagsText] = useState((product?.tags || ['organic', 'pure', 'barakah']).join(', '));

  // Variants / packages
  const [packages, setPackages] = useState<ProductVariant[]>(
    product?.packages && product.packages.length > 0
      ? product.packages
      : [
          {
            id: `v-1`,
            label: product?.weight || '১ একক / বোতল',
            price: product?.price || 250,
            oldPrice: product?.oldPrice,
            stock: product?.stock || 50,
          },
        ]
  );

  // Status flags
  const [isActive, setIsActive] = useState(product ? product.isActive !== false : true);
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.isFeatured));
  const [isBestSeller, setIsBestSeller] = useState(
    Boolean(product?.isBestSeller || product?.badges?.includes('BEST SELLING'))
  );
  const [isNewArrival, setIsNewArrival] = useState(
    Boolean(product?.isNewArrival || product?.badges?.includes('NEW ARRIVAL'))
  );
  const [isOffer, setIsOffer] = useState(
    Boolean(product?.isOffer || product?.badges?.includes('OFFER'))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      {
        id: `v-${Date.now()}`,
        label: 'নতুন সাইজ/প্যাক',
        price: Number(price) || 100,
        stock: 50,
      },
    ]);
  };

  const handleUpdatePackage = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length <= 1) return;
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation
    if (!name.trim()) {
      setError('পণ্যের ইংরেজি নাম আবশ্যক!');
      return;
    }
    if (price <= 0) {
      setError('পণ্যের বিক্রয় মূল্য ০ এর বেশি হতে হবে!');
      return;
    }
    if (stock < 0) {
      setError('স্টক সংখ্যা ঋণাত্মক হতে পারে না!');
      return;
    }

    setSaving(true);
    try {
      const selectedCat = categories.find((c) => c.name === category);
      const galleryList = galleryText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const tagsList = tagsText
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // Build badges
      const badges: any[] = [];
      if (isBestSeller) badges.push('BEST SELLING');
      if (isNewArrival) badges.push('NEW ARRIVAL');
      if (isOffer) badges.push('OFFER');
      if (stock <= 0) badges.push('OUT OF STOCK');

      // Synchronize primary package
      const updatedPackages = packages.map((pkg, idx) => {
        if (idx === 0) {
          return {
            ...pkg,
            label: pkg.label || weight,
            price: Number(price),
            oldPrice: oldPrice ? Number(oldPrice) : undefined,
            stock: Number(stock),
          };
        }
        return pkg;
      });

      const payload: Partial<Product> = {
        name: name.trim(),
        banglaName: banglaName.trim() || name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        categorySlug: selectedCat?.slug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: brand.trim() || 'Barakah Agro',
        sku: sku.trim(),
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        stock: Number(stock),
        weight: weight.trim(),
        unit: unit.trim(),
        image: image.trim(),
        gallery: galleryList.length > 0 ? galleryList : [image.trim()],
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        ingredients: ingredients.trim(),
        tags: tagsList,
        badges,
        packages: updatedPackages,
        isActive,
        isFeatured,
        isBestSeller,
        isNewArrival,
        isOffer,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'পণ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Package2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {isEdit ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add New Product)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEdit ? `আইডি: ${product?.id} | SKU: ${product?.sku}` : 'ডাটাবেজে নতুন পণ্য সংরক্ষণ করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Names & Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              ১. সাধারণ তথ্য (Basic Info)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পণ্যের নাম (English Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sundarban Natural Honey 500g"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  বাংলা নাম (Bengali Name) *
                </label>
                <input
                  type="text"
                  required
                  value={banglaName}
                  onChange={(e) => setBanglaName(e.target.value)}
                  placeholder="যেমন: সুন্দরবনের প্রাকৃতিক মধু ৫০০ গ্রাম"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি (Category)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.banglaName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ব্র্যান্ড (Brand)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Barakah Agro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU / কোড</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="BA-1001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing, Stock & Measurement */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-600" />
              ২. মূল্য ও স্টক (Price & Inventory)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিক্রয় মূল্য (৳) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="450"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পুরোনো মূল্য (ছাড় ৳)</label>
                <input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">স্টক পরিমাণ *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="50"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {stock <= 0 ? '⚠️ স্টক শেষ দেখাবে' : `${stock} পিস স্টক`}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ওজন / সাইজ</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="500g / 1L"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Images & Media */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Image size={14} className="text-emerald-600" />
              ৩. ছবির লিংক (Product Images)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-3 flex items-center justify-center">
                <div className="w-24 h-24 rounded-xl border border-slate-200 p-1 bg-slate-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/barakah/logo.jpeg';
                    }}
                  />
                </div>
              </div>
              <div className="sm:col-span-9 space-y-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রধান ছবির URL (Main Image)</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/images/barakah/sorisa5liter.png"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    অতিরিক্ত গ্যালারি ছবি (প্রতি লাইনে একটি URL)
                  </label>
                  <textarea
                    rows={2}
                    value={galleryText}
                    onChange={(e) => setGalleryText(e.target.value)}
                    placeholder="https://.../photo1.jpg&#10;https://.../photo2.jpg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Descriptions & Benefits */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5">
              ৪. বর্ণনা ও উপাদান (Descriptions & Ingredients)
            </h4>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="যেমন: শতভাগ খাঁটি ও স্বাস্থ্যসম্মত সরিষার তেল"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">বিস্তারিত বিবরণ (Full Description)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="পণ্যের গুণাগুণ, খাওয়ার নিয়ম, উৎপাদনের তথ্য..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ট্যাগসমূহ (কমা দিয়ে পৃথক করুন)</label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="organic, honey, pure, barakah"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Section 5: Variants / Packages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600" />
                ৫. প্যাকেজ / সাইজ ভ্যারিয়েন্ট (Packages & Variants)
              </h4>
              <button
                type="button"
                onClick={handleAddPackage}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1"
              >
                <Plus size={12} />
                প্যাক যোগ করুন
              </button>
            </div>

            <div className="space-y-2">
              {packages.map((pkg, idx) => (
                <div
                  key={pkg.id || idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl items-center text-xs"
                >
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-500 block">লেবেল / সাইজ</label>
                    <input
                      type="text"
                      value={pkg.label}
                      onChange={(e) => handleUpdatePackage(idx, 'label', e.target.value)}
                      placeholder="e.g. ৫০০ গ্রাম বোতল"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-500 block">মূল্য (৳)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handleUpdatePackage(idx, 'price', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-500 block">স্টক</label>
                    <input
                      type="number"
                      value={pkg.stock || stock}
                      onChange={(e) => handleUpdatePackage(idx, 'stock', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Badges & Display Status */}
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5">
              ৬. স্ট্যাটাস ও ভিজিবিলিটি (Visibility & Flags)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">অ্যাক্টিভ (Active)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">ফিচার্ড (Featured)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-800">বেস্ট সেলার</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">নিউ অ্যারাইভাল</span>
              </label>
            </div>
          </div>

          {/* Modal Footer Buttons */}
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
                  সংরক্ষণ করুন (Save to Database)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
