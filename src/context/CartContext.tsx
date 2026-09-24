import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '../types/ecommerce';
import { validateCoupon } from '../services/api';

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountValue: number;
  discountType: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, openDrawer?: boolean) => void;
  removeFromCart: (productId: number | string, packageLabel: string) => void;
  updateQuantity: (productId: number | string, packageLabel: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  calculateShipping: (location: 'inside' | 'outside') => number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'barakah_agro_cart';
const COUPON_STORAGE_KEY = 'barakah_agro_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const freeShippingThreshold = 2000;

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: CartItem, openDrawer = true) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === newItem.productId && item.packageLabel === newItem.packageLabel
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + newItem.quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newItem.stock ? Math.min(newQty, newItem.stock) : newQty,
        };
        return updated;
      }

      return [...prev, newItem];
    });

    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: number | string, packageLabel: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.packageLabel === packageLabel)
      )
    );
  };

  const updateQuantity = (productId: number | string, packageLabel: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.packageLabel === packageLabel) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (item.stock && nextQty > item.stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await validateCoupon(code, subtotal);
      setAppliedCoupon({
        code: res.code,
        discountAmount: res.discountAmount,
        discountValue: res.discountValue,
        discountType: res.discountType,
      });
      return true;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const calculateShipping = (location: 'inside' | 'outside'): number => {
    if (subtotal >= freeShippingThreshold) {
      return 0;
    }
    return location === 'inside' ? 80 : 130;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isDrawerOpen,
        setIsDrawerOpen,
        appliedCoupon,
        couponError,
        applyCouponCode,
        removeCoupon,
        calculateShipping,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
