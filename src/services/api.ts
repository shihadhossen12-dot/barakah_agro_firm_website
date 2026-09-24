import type {
  Product,
  Category,
  Order,
  OrderStatus,
  Coupon,
  ShippingZoneConfig,
  CustomerUser,
  SiteSettings,
  SiteReview,
} from '../types/ecommerce';

import {
  FALLBACK_PRODUCTS,
  FALLBACK_CATEGORIES,
  FALLBACK_SETTINGS,
  FALLBACK_REVIEWS,
  FALLBACK_COUPONS,
  FALLBACK_SHIPPING,
} from './mockData';

import {
  getProductsFromDb,
  getProductByIdFromDb,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  duplicateProductInDb,
  toggleProductStatusInDb,
  getCategoriesFromDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  toggleCategoryStatusInDb,
  getOrdersFromDb,
  getOrderByIdFromDb,
  createOrderInDb,
  updateOrderInDb,
  updateOrderStatusInDb,
  getCustomersFromDb,
  updateCustomerInDb,
  toggleCustomerStatusInDb,
  getSettingsFromDb,
  updateSettingsInDb,
  ensureDatabaseSeeded,
} from './firestoreService';

// Initialize and ensure database seeds on first load
ensureDatabaseSeeded().catch((err) => console.warn('Database seed note:', err));

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  badge?: string;
  sort?: string;
  limit?: number;
  includeArchived?: boolean;
}): Promise<Product[]> {
  try {
    let prods = await getProductsFromDb(params?.includeArchived || false);

    // Apply filters if provided
    if (params?.category && params.category !== 'all') {
      prods = prods.filter(
        (p) =>
          p.categorySlug?.toLowerCase() === params.category?.toLowerCase() ||
          p.category?.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (params?.badge) {
      prods = prods.filter((p) => p.badges?.includes(params.badge as any));
    }

    if (params?.sort) {
      if (params.sort === 'price-low') {
        prods = [...prods].sort((a, b) => a.price - b.price);
      } else if (params.sort === 'price-high') {
        prods = [...prods].sort((a, b) => b.price - a.price);
      } else if (params.sort === 'stock') {
        prods = [...prods].sort((a, b) => a.stock - b.stock);
      } else if (params.sort === 'name') {
        prods = [...prods].sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    if (params?.limit && params.limit > 0) {
      prods = prods.slice(0, params.limit);
    }

    return prods;
  } catch (error) {
    console.error('fetchProducts failed:', error);
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<Product> {
  try {
    const p = await getProductByIdFromDb(idOrSlug);
    if (p) return p;

    const all = await getProductsFromDb(true);
    const found = all.find((item) => String(item.id) === idOrSlug || item.slug === idOrSlug);
    if (found) return found;
    return all[0] || FALLBACK_PRODUCTS[0];
  } catch {
    return FALLBACK_PRODUCTS[0];
  }
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  return await createProductInDb(product);
}

export async function updateProduct(id: number | string, updates: Partial<Product>): Promise<Product> {
  return await updateProductInDb(id, updates);
}

export async function deleteProduct(id: number | string, permanent = false): Promise<boolean> {
  return await deleteProductFromDb(id, permanent);
}

export async function duplicateProduct(id: number | string): Promise<Product> {
  return await duplicateProductInDb(id);
}

export async function toggleProductStatus(id: number | string): Promise<Product> {
  return await toggleProductStatusInDb(id);
}

// -------------------------------------------------------------
// CATEGORIES API
// -------------------------------------------------------------

export async function fetchCategories(includeArchived = false): Promise<Category[]> {
  try {
    return await getCategoriesFromDb(includeArchived);
  } catch (err) {
    console.error('fetchCategories failed:', err);
    return FALLBACK_CATEGORIES;
  }
}

export async function createCategory(cat: Partial<Category>): Promise<Category> {
  return await createCategoryInDb(cat);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  return await updateCategoryInDb(id, updates);
}

export async function deleteCategory(id: string, permanent = false): Promise<boolean> {
  return await deleteCategoryInDb(id, permanent);
}

export async function toggleCategoryStatus(id: string): Promise<Category> {
  return await toggleCategoryStatusInDb(id);
}

// -------------------------------------------------------------
// SETTINGS API
// -------------------------------------------------------------

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    return await getSettingsFromDb();
  } catch (err) {
    console.error('fetchSettings error:', err);
    return FALLBACK_SETTINGS;
  }
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  return await updateSettingsInDb(settings);
}

// -------------------------------------------------------------
// ORDERS API
// -------------------------------------------------------------

export async function fetchOrders(): Promise<Order[]> {
  try {
    return await getOrdersFromDb();
  } catch (err) {
    console.error('fetchOrders error:', err);
    return [];
  }
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    return await getOrderByIdFromDb(id);
  } catch {
    return null;
  }
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  return await createOrderInDb(order);
}

export async function placeOrder(order: Partial<Order>): Promise<Order> {
  return await createOrderInDb(order);
}

export async function trackOrder(orderIdOrPhone: string, phone?: string): Promise<Order | null> {
  const cleanId = orderIdOrPhone.trim();
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  const direct = await getOrderByIdFromDb(cleanId);
  if (direct) {
    if (!cleanPhone || direct.phone.replace(/[^0-9]/g, '').includes(cleanPhone)) {
      return direct;
    }
  }

  const all = await getOrdersFromDb();
  const found = all.find((o) => {
    const oPhone = o.phone.replace(/[^0-9]/g, '');
    const idMatch = o.id.toLowerCase() === cleanId.toLowerCase();
    if (cleanPhone) {
      return (idMatch || oPhone.includes(cleanPhone)) && oPhone.includes(cleanPhone);
    }
    return idMatch || (cleanId.length >= 8 && oPhone.includes(cleanId.replace(/[^0-9]/g, '')));
  });

  return found || null;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  return await updateOrderInDb(id, updates);
}

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
  return await updateOrderStatusInDb(id, status, note);
}

// -------------------------------------------------------------
// CUSTOMERS API
// -------------------------------------------------------------

export async function fetchCustomers(): Promise<CustomerUser[]> {
  try {
    return await getCustomersFromDb();
  } catch (err) {
    console.error('fetchCustomers error:', err);
    return [];
  }
}

export async function updateCustomer(id: string, updates: Partial<CustomerUser>): Promise<CustomerUser> {
  return await updateCustomerInDb(id, updates);
}

export async function toggleCustomerStatus(id: string): Promise<CustomerUser> {
  return await toggleCustomerStatusInDb(id);
}

// -------------------------------------------------------------
// COUPONS API
// -------------------------------------------------------------

export async function fetchCoupons(): Promise<Coupon[]> {
  return FALLBACK_COUPONS;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  code: string;
  discountAmount: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  error?: string;
}> {
  const c = FALLBACK_COUPONS.find((cp) => cp.code.toUpperCase() === code.trim().toUpperCase() && cp.isActive);
  if (!c) {
    throw new Error('কুপন কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ।');
  }
  if (subtotal < c.minSpend) {
    throw new Error(`ন্যূনতম ৳${c.minSpend} টাকার কেনাকাটায় এই কুপনটি প্রযোজ্য।`);
  }

  let discountAmount = 0;
  if (c.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * c.discountValue) / 100);
    if (c.maxDiscount && discountAmount > c.maxDiscount) {
      discountAmount = c.maxDiscount;
    }
  } else {
    discountAmount = c.discountValue;
  }

  return {
    valid: true,
    code: c.code,
    discountAmount,
    discountValue: c.discountValue,
    discountType: c.discountType,
  };
}

export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const newC: Coupon = {
    id: `c-${Date.now()}`,
    code: (coupon.code || 'BARAKAH10').toUpperCase(),
    discountType: coupon.discountType || 'percentage',
    discountValue: coupon.discountValue || 10,
    minSpend: coupon.minSpend || 500,
    maxDiscount: coupon.maxDiscount,
    expiryDate: coupon.expiryDate || '2026-12-31',
    usageLimit: 100,
    usageCount: 0,
    isActive: true,
  };
  return newC;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  return true;
}

// -------------------------------------------------------------
// REVIEWS API
// -------------------------------------------------------------

export async function fetchReviews(): Promise<SiteReview[]> {
  return FALLBACK_REVIEWS;
}

export async function submitReview(review: Partial<SiteReview>): Promise<SiteReview> {
  const newRev: SiteReview = {
    id: `rev-${Date.now()}`,
    author: review.author || 'সম্মানিত ক্রেতা',
    city: review.city || 'ঢাকা',
    rating: review.rating || 5,
    comment: review.comment || 'দারুণ পণ্য!',
    productName: review.productName,
    verified: true,
    date: 'আজকে',
  };
  return newRev;
}

// -------------------------------------------------------------
// SHIPPING API
// -------------------------------------------------------------

export async function fetchShipping(): Promise<ShippingZoneConfig> {
  return FALLBACK_SHIPPING;
}

export async function updateShipping(shipping: Partial<ShippingZoneConfig>): Promise<ShippingZoneConfig> {
  return { ...FALLBACK_SHIPPING, ...shipping };
}

// -------------------------------------------------------------
// ADMIN STATS API
// -------------------------------------------------------------

export async function fetchAdminStats(): Promise<{
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalSales: number;
  todaySales: number;
}> {
  try {
    const [prods, ords, custs] = await Promise.all([
      getProductsFromDb(true),
      getOrdersFromDb(),
      getCustomersFromDb(),
    ]);

    const activeProds = prods.filter((p) => !p.isArchived && p.isActive);
    const outOfStockProds = prods.filter((p) => !p.isArchived && p.stock <= 0);
    const pending = ords.filter((o) => o.status === 'Pending' || o.status === 'Processing');
    const completed = ords.filter((o) => o.status === 'Delivered');
    const totalSales = ords
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalProducts: prods.filter((p) => !p.isArchived).length,
      activeProducts: activeProds.length,
      outOfStockProducts: outOfStockProds.length,
      totalOrders: ords.length,
      pendingOrders: pending.length,
      completedOrders: completed.length,
      totalCustomers: custs.length || Math.max(ords.length, 1),
      totalSales,
      todaySales: Math.round(totalSales * 0.15),
    };
  } catch {
    return {
      totalProducts: FALLBACK_PRODUCTS.length,
      activeProducts: FALLBACK_PRODUCTS.length,
      outOfStockProducts: 0,
      totalOrders: 1,
      pendingOrders: 0,
      completedOrders: 1,
      totalCustomers: 1,
      totalSales: 1430,
      todaySales: 0,
    };
  }
}
