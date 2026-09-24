export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface ProductVariant {
  id: string;
  label: string; // e.g. "১ লিটার" or "৫০০ গ্রাম"
  price: number;
  oldPrice?: number;
  discount?: string;
  stock?: number;
  sku?: string;
}

export interface Product {
  id: number | string;
  name: string;
  banglaName?: string;
  slug: string;
  category: string;
  categorySlug: string;
  brand: string;
  sku: string;
  price: number;
  oldPrice?: number;
  costPrice?: number;
  discountPercentage?: number;
  stock: number;
  weight?: string;
  unit?: string;
  image: string;
  gallery?: string[];
  packages: ProductVariant[];
  shortDescription: string;
  description: string;
  benefits?: string[];
  ingredients?: string;
  weightUnit?: string;
  tags?: string[];
  rating: number;
  reviewCount: number;
  badges?: ('NEW ARRIVAL' | 'BEST SELLING' | 'TRENDING' | 'OFFER' | 'LIMITED STOCK' | 'OUT OF STOCK')[];
  isFeatured?: boolean;
  isOffer?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isArchived?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  isActive: boolean;
  isArchived?: boolean;
  displayOrder: number;
}

export interface CartItem {
  productId: number | string;
  name: string;
  banglaName?: string;
  image: string;
  packageLabel: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. "BA-2026-000101"
  customerName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  deliveryLocation: 'inside' | 'outside';
  deliveryInstructions?: string;
  items: {
    productId: number | string;
    name: string;
    packageLabel: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'online';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  transactionId?: string;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface ShippingZoneConfig {
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeShippingThreshold: number;
  estimatedInsideDays: string;
  estimatedOutsideDays: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  defaultAddress?: string;
  defaultDistrict?: string;
  defaultDivision?: string;
  createdAt: string;
  ordersCount?: number;
  totalSpent?: number;
  isActive?: boolean;
}

export interface SiteReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  productName?: string;
  image?: string;
  verified: boolean;
  date: string;
}

export interface SiteSettings {
  storeName: string;
  banglaStoreName: string;
  tagline: string;
  banglaTagline: string;
  logo: string;
  hotline: string;
  whatsappNumber: string;
  email: string;
  address: string;
  announcementText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  heroButton2Text?: string;
  heroButton2Link?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  footerAbout?: string;
  freeShippingThreshold: number;
  insideDhakaFee: number;
  outsideDhakaFee: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'manager';
  isActive: boolean;
  createdAt: string;
}
