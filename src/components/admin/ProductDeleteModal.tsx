import React, { useState } from 'react';
import { AlertTriangle, Trash2, Archive, X } from 'lucide-react';
import type { Product } from '../../types/ecommerce';

interface ProductDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmArchive: (product: Product) => Promise<void>;
  onConfirmPermanentDelete?: (product: Product) => Promise<void>;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmArchive,
  onConfirmPermanentDelete,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleArchive = async () => {
    setLoading(true);
    try {
      await onConfirmArchive(product);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanent = async () => {
    if (!onConfirmPermanentDelete) return;
    setLoading(true);
    try {
      await onConfirmPermanentDelete(product);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            পণ্য মুছে ফেলার নিশ্চয়তা (Delete Confirmation)
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Are you sure you want to delete this product?
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 object-contain rounded-lg bg-white border border-slate-200 p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/barakah/logo.jpeg';
            }}
          />
          <div className="text-xs overflow-hidden">
            <div className="font-bold text-slate-900 truncate">
              {product.banglaName || product.name}
            </div>
            <div className="text-slate-500 text-[11px]">
              মূল্য: ৳{product.price} | স্টক: {product.stock} টি
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          পণ্যটি আর্কাইভ/ডিলিট করলে তাৎক্ষণিকভাবে ওয়েবসাইট শপ, ক্যাটাগরি পেজ ও সার্চ রেজাল্ট থেকে মুছে যাবে।
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            CANCEL (বাতিল)
          </button>

          <button
            type="button"
            onClick={handleArchive}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-900/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            DELETE (মুছে ফেলুন)
          </button>
        </div>
      </div>
    </div>
  );
};
