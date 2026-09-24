import React, { useState } from 'react';
import { ShoppingCart, Heart, Zap, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import type { Product, ProductVariant } from '../types/ecommerce';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onInstantBuy?: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onInstantBuy,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Selected package variant (defaults to first variant)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const packages = product.packages && product.packages.length > 0
    ? product.packages
    : [{ id: 'default', label: '১ একক', price: product.price, oldPrice: product.oldPrice, stock: product.stock }];

  const currentVariant = packages[selectedVariantIndex] || packages[0];
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      banglaName: product.banglaName,
      image: product.image,
      packageLabel: currentVariant.label,
      price: currentVariant.price,
      quantity,
      stock: currentVariant.stock || product.stock,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInstantBuy) {
      onInstantBuy(product, currentVariant, quantity);
    } else {
      addToCart(
        {
          productId: product.id,
          name: product.name,
          banglaName: product.banglaName,
          image: product.image,
          packageLabel: currentVariant.label,
          price: currentVariant.price,
          quantity,
          stock: currentVariant.stock || product.stock,
        },
        false
      );
    }
  };

  const primaryBadge = product.badges && product.badges.length > 0 ? product.badges[0] : null;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
        <div>
          {primaryBadge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider ${
                primaryBadge === 'OFFER'
                  ? 'bg-rose-600 text-white'
                  : primaryBadge === 'BEST SELLING'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {primaryBadge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 transition-all"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/barakah/logo.jpeg';
          }}
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded border border-rose-200">
              স্টক শেষ (Out of Stock)
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="truncate">{product.category}</span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[2.6rem]">
          {product.banglaName || product.name}
        </h3>

        {/* Package / Size Variant Selector */}
        {packages.length > 1 && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              প্যাকেজ নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {packages.map((pkg, idx) => (
                <button
                  key={pkg.id || idx}
                  type="button"
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`py-1 px-1.5 text-[11px] font-medium rounded border transition-all text-center truncate ${
                    selectedVariantIndex === idx
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {pkg.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price & Discount */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
            ৳ {currentVariant.price}
          </span>
          {currentVariant.oldPrice && currentVariant.oldPrice > currentVariant.price && (
            <span className="text-xs text-slate-400 line-through tabular-nums">
              ৳ {currentVariant.oldPrice}
            </span>
          )}
          {currentVariant.discount && (
            <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {currentVariant.discount}
            </span>
          )}
        </div>

        {/* Quantity Controls & Action Buttons */}
        <div className="mt-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-8 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-semibold text-slate-800 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-8 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                addedAnimation
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#14532d] hover:bg-[#166534] active:scale-98 text-white'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>যুক্ত হয়েছে!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>কার্টে যোগ করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>সরাসরি অর্ডার করুন (Buy Now)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
