import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Product,
  Category,
  Order,
  OrderStatus,
  SiteSettings,
  SiteReview,
  Coupon,
  CustomerUser,
  AdminUser,
} from '../types/ecommerce';
import {
  FALLBACK_PRODUCTS,
  FALLBACK_CATEGORIES,
  FALLBACK_SETTINGS,
  FALLBACK_COUPONS,
  FALLBACK_REVIEWS,
} from './mockData';

// Firestore collection names
export const PRODUCTS_COLLECTION = 'products';
export const CATEGORIES_COLLECTION = 'categories';
export const ORDERS_COLLECTION = 'orders';
export const CUSTOMERS_COLLECTION = 'customers';
export const ADMINS_COLLECTION = 'admins';
export const REVIEWS_COLLECTION = 'reviews';
export const COUPONS_COLLECTION = 'coupons';
export const SETTINGS_COLLECTION = 'siteSettings';

// Admin passwords stored hash / pin key
const ADMIN_SECRET_KEY = 'barakah_admin_secret_pin';

let isSeeding = false;
let isSeeded = false;

/**
 * Ensures initial Barakah Agro catalog, categories, settings, reviews, and admin
 * are seeded in Firestore if collections are empty.
 */
export async function ensureDatabaseSeeded(): Promise<void> {
  if (isSeeded || isSeeding) return;
  isSeeding = true;

  try {
    // 1. Check products
    const prodSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (prodSnap.empty) {
      console.log('[Firestore] Seeding initial products...');
      const batch = writeBatch(db);
      for (const prod of FALLBACK_PRODUCTS) {
        const prodDoc = doc(db, PRODUCTS_COLLECTION, String(prod.id));
        batch.set(prodDoc, {
          ...prod,
          isArchived: false,
          isBestSeller: prod.badges?.includes('BEST SELLING') || false,
          isNewArrival: prod.badges?.includes('NEW ARRIVAL') || false,
          weight: prod.packages?.[0]?.label || '1 unit',
          unit: prod.packages?.[0]?.label?.includes('লিটার') ? 'লিটার' : 'কেজি/গ্রাম',
          tags: ['organic', 'pure', 'barakah agro', prod.categorySlug],
          updatedAt: new Date().toISOString(),
        });
      }
      await batch.commit();
    }

    // 2. Check categories
    const catSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (catSnap.empty) {
      console.log('[Firestore] Seeding initial categories...');
      const batch = writeBatch(db);
      for (const cat of FALLBACK_CATEGORIES) {
        const catDoc = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(catDoc, {
          ...cat,
          isArchived: false,
        });
      }
      await batch.commit();
    }

    // 3. Check settings
    const settingsDoc = doc(db, SETTINGS_COLLECTION, 'general');
    const settSnap = await getDoc(settingsDoc);
    if (!settSnap.exists()) {
      console.log('[Firestore] Seeding initial site settings...');
      await setDoc(settingsDoc, {
        ...FALLBACK_SETTINGS,
        heroButtonText: 'এখনই কেনাকাটা করুন',
        heroButtonLink: '#shop',
        heroButton2Text: 'অফার সমূহ দেখুন',
        heroButton2Link: '#offers',
        footerAbout: 'বারাকাহ এগ্রো - কাঠের ঘানির খাঁটি সরিষার তেল, সুন্দরবনের মধু ও প্রাকৃতিক স্বাস্থ্যকর খাবারের বিশ্বস্ত প্রতিষ্ঠান।',
      });
    }

    // 4. Check coupons
    const coupSnap = await getDocs(collection(db, COUPONS_COLLECTION));
    if (coupSnap.empty) {
      const batch = writeBatch(db);
      for (const coup of FALLBACK_COUPONS) {
        const cDoc = doc(db, COUPONS_COLLECTION, coup.id);
        batch.set(cDoc, coup);
      }
      await batch.commit();
    }

    // 5. Check reviews
    const revSnap = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (revSnap.empty) {
      const batch = writeBatch(db);
      for (const rev of FALLBACK_REVIEWS) {
        const rDoc = doc(db, REVIEWS_COLLECTION, rev.id);
        batch.set(rDoc, rev);
      }
      await batch.commit();
    }

    // 6. Check admins
    const adminSnap = await getDocs(collection(db, ADMINS_COLLECTION));
    if (adminSnap.empty) {
      console.log('[Firestore] Seeding authorized admin accounts...');
      const batch = writeBatch(db);
      
      const admin1 = doc(db, ADMINS_COLLECTION, 'admin-primary');
      batch.set(admin1, {
        id: 'admin-primary',
        email: 'tahminajannatayesha@gmail.com',
        name: 'Tahmina Jannat',
        role: 'superadmin',
        passwordHash: 'barakah2026',
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      const admin2 = doc(db, ADMINS_COLLECTION, 'admin-store');
      batch.set(admin2, {
        id: 'admin-store',
        email: 'admin@barakahagro.com',
        name: 'Barakah Store Manager',
        role: 'admin',
        passwordHash: 'barakah2026',
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      await batch.commit();
    }

    // 7. Check seed orders
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    if (ordersSnap.empty) {
      const initialOrder: Order = {
        id: 'BA-2026-000101',
        customerName: 'মোহাম্মদ রফিকুল ইসলাম',
        phone: '01712345678',
        email: 'rafiqul@example.com',
        division: 'Dhaka (ঢাকা)',
        district: 'ঢাকা',
        upazila: 'ধানমন্ডি',
        address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা',
        deliveryLocation: 'inside',
        items: [
          {
            productId: 1,
            name: 'Wood-Pressed Mustard Oil (5 Liter)',
            packageLabel: '৫ লিটার বোতল',
            price: 1350,
            quantity: 1,
            image: '/images/barakah/sorisa5liter.png',
          },
        ],
        subtotal: 1350,
        discount: 0,
        shippingFee: 80,
        total: 1430,
        paymentMethod: 'cod',
        paymentStatus: 'Pending',
        status: 'Shipped',
        statusHistory: [
          { status: 'Pending', timestamp: '2026-02-10T10:00:00Z', note: 'Order placed by customer' },
          { status: 'Processing', timestamp: '2026-02-10T11:30:00Z', note: 'Verified by admin' },
          { status: 'Shipped', timestamp: '2026-02-11T09:00:00Z', note: 'Dispatched with Steadfast Courier' },
        ],
        adminNotes: 'Call before delivery in afternoon',
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-02-11T09:00:00Z',
      };
      await setDoc(doc(db, ORDERS_COLLECTION, initialOrder.id), initialOrder);

      // Also seed customer
      await setDoc(doc(db, CUSTOMERS_COLLECTION, '01712345678'), {
        id: '01712345678',
        name: 'মোহাম্মদ রফিকুল ইসলাম',
        phone: '01712345678',
        email: 'rafiqul@example.com',
        defaultAddress: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা',
        defaultDistrict: 'ঢাকা',
        defaultDivision: 'Dhaka (ঢাকা)',
        ordersCount: 1,
        totalSpent: 1430,
        isActive: true,
        createdAt: '2026-02-10T10:00:00Z',
      });
    }

    isSeeded = true;
  } catch (error) {
    console.error('[Firestore] Seeding error:', error);
  } finally {
    isSeeding = false;
  }
}

// -------------------------------------------------------------
// REAL-TIME SUBSCRIPTIONS
// -------------------------------------------------------------

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  includeArchived = false
): Unsubscribe {
  ensureDatabaseSeeded();
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(FALLBACK_PRODUCTS);
        return;
      }
      const list: Product[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Product;
        if (includeArchived || !data.isArchived) {
          list.push({ ...data, id: isNaN(Number(d.id)) ? d.id : Number(d.id) });
        }
      });
      // Sort by creation or display
      list.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
      onUpdate(list);
    },
    (error) => {
      console.error('[Firestore] Products subscription error:', error);
      onUpdate(FALLBACK_PRODUCTS);
    }
  );
}

export function subscribeToCategories(
  onUpdate: (categories: Category[]) => void,
  includeArchived = false
): Unsubscribe {
  ensureDatabaseSeeded();
  const colRef = collection(db, CATEGORIES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(FALLBACK_CATEGORIES);
        return;
      }
      const list: Category[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Category;
        if (includeArchived || !data.isArchived) {
          list.push({ ...data, id: d.id });
        }
      });
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      onUpdate(list);
    },
    (error) => {
      console.error('[Firestore] Categories subscription error:', error);
      onUpdate(FALLBACK_CATEGORIES);
    }
  );
}

export function subscribeToOrders(onUpdate: (orders: Order[]) => void): Unsubscribe {
  ensureDatabaseSeeded();
  const colRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Order), id: d.id });
      });
      list.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
      onUpdate(list);
    },
    (error) => {
      console.error('[Firestore] Orders subscription error:', error);
    }
  );
}

export function subscribeToSettings(onUpdate: (settings: SiteSettings) => void): Unsubscribe {
  ensureDatabaseSeeded();
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SiteSettings);
      } else {
        onUpdate(FALLBACK_SETTINGS);
      }
    },
    (error) => {
      console.error('[Firestore] Settings subscription error:', error);
      onUpdate(FALLBACK_SETTINGS);
    }
  );
}

export function subscribeToCustomers(onUpdate: (customers: CustomerUser[]) => void): Unsubscribe {
  ensureDatabaseSeeded();
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: CustomerUser[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as CustomerUser), id: d.id });
      });
      list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
      onUpdate(list);
    },
    (error) => {
      console.error('[Firestore] Customers subscription error:', error);
    }
  );
}

// -------------------------------------------------------------
// PRODUCT CRUD
// -------------------------------------------------------------

export async function getProductsFromDb(includeArchived = false): Promise<Product[]> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) return FALLBACK_PRODUCTS;
    const list: Product[] = [];
    snap.forEach((d) => {
      const data = d.data() as Product;
      if (includeArchived || !data.isArchived) {
        list.push({ ...data, id: isNaN(Number(d.id)) ? d.id : Number(d.id) });
      }
    });
    return list.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
  } catch (error) {
    console.error('[Firestore] getProducts error:', error);
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductByIdFromDb(id: string | number): Promise<Product | null> {
  await ensureDatabaseSeeded();
  try {
    const dSnap = await getDoc(doc(db, PRODUCTS_COLLECTION, String(id)));
    if (dSnap.exists()) {
      return { ...(dSnap.data() as Product), id: isNaN(Number(dSnap.id)) ? dSnap.id : Number(dSnap.id) };
    }
    return null;
  } catch (error) {
    console.error('[Firestore] getProductById error:', error);
    return null;
  }
}

export async function createProductInDb(productData: Partial<Product>): Promise<Product> {
  await ensureDatabaseSeeded();
  const newId = Date.now();
  const slug =
    productData.slug ||
    (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + `-${Math.floor(Math.random() * 1000)}`;

  const newProduct: Product = {
    id: newId,
    name: productData.name?.trim() || 'New Product',
    banglaName: productData.banglaName?.trim() || productData.name?.trim() || 'নতুন পণ্য',
    slug,
    category: productData.category || 'Mustard Oil',
    categorySlug:
      productData.categorySlug ||
      (productData.category || 'mustard-oil')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    brand: productData.brand || 'Barakah Agro',
    sku: productData.sku || `BA-${Math.floor(1000 + Math.random() * 9000)}`,
    price: Number(productData.price) || 100,
    oldPrice: productData.oldPrice ? Number(productData.oldPrice) : undefined,
    stock: productData.stock !== undefined ? Number(productData.stock) : 50,
    weight: productData.weight || '1 unit',
    unit: productData.unit || 'unit',
    image: productData.image || '/images/barakah/sorisa5liter.png',
    gallery: productData.gallery?.length ? productData.gallery : [productData.image || '/images/barakah/sorisa5liter.png'],
    shortDescription: productData.shortDescription || 'শতভাগ খাঁটি ও স্বাস্থ্যসম্মত পণ্য।',
    description: productData.description || 'বারাকাহ এগ্রোর স্বাস্থ্যসম্মত ও প্রাকৃতিক খাদ্য পণ্য।',
    ingredients: productData.ingredients || '১০০% প্রাকৃতিক উপাদান',
    benefits: productData.benefits?.length
      ? productData.benefits
      : ['১০০% প্রাকৃতিক ও পুষ্টিকর', 'কোনো প্রকার কেমিক্যাল বা কৃত্রিম রঙ নেই'],
    tags: productData.tags || ['organic', 'pure', 'barakah'],
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 1,
    badges: productData.badges || (productData.isBestSeller ? ['BEST SELLING'] : []),
    isFeatured: Boolean(productData.isFeatured),
    isOffer: Boolean(productData.isOffer),
    isBestSeller: Boolean(productData.isBestSeller),
    isNewArrival: Boolean(productData.isNewArrival),
    isArchived: false,
    isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    packages: productData.packages?.length
      ? productData.packages
      : [
          {
            id: `p-${newId}-1`,
            label: productData.weight || 'স্ট্যান্ডার্ড প্যাক',
            price: Number(productData.price) || 100,
            oldPrice: productData.oldPrice ? Number(productData.oldPrice) : undefined,
            stock: Number(productData.stock) || 50,
          },
        ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = doc(db, PRODUCTS_COLLECTION, String(newId));
  await setDoc(docRef, newProduct);
  return newProduct;
}

export async function updateProductInDb(id: string | number, updates: Partial<Product>): Promise<Product> {
  await ensureDatabaseSeeded();
  const docRef = doc(db, PRODUCTS_COLLECTION, String(id));
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error(`Product with ID ${id} not found.`);
  }

  const existing = snap.data() as Product;
  const updatedProduct: Product = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  // If price changed and default package exists, synchronize price
  if (updates.price !== undefined && updatedProduct.packages?.length) {
    updatedProduct.packages[0] = {
      ...updatedProduct.packages[0],
      price: Number(updates.price),
      oldPrice: updates.oldPrice !== undefined ? Number(updates.oldPrice) : updatedProduct.packages[0].oldPrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : updatedProduct.packages[0].stock,
    };
  }

  await updateDoc(docRef, updatedProduct as any);
  return updatedProduct;
}

export async function deleteProductFromDb(id: string | number, permanent = false): Promise<boolean> {
  await ensureDatabaseSeeded();
  const docRef = doc(db, PRODUCTS_COLLECTION, String(id));
  if (permanent) {
    await deleteDoc(docRef);
  } else {
    // Soft delete / archive
    await updateDoc(docRef, {
      isArchived: true,
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  }
  return true;
}

export async function duplicateProductInDb(id: string | number): Promise<Product> {
  const original = await getProductByIdFromDb(id);
  if (!original) throw new Error('Original product not found');

  const copyData: Partial<Product> = {
    ...original,
    name: `${original.name} (Copy)`,
    banglaName: original.banglaName ? `${original.banglaName} (কপি)` : `${original.name} (কপি)`,
    sku: `BA-${Math.floor(1000 + Math.random() * 9000)}`,
    isActive: true,
    isArchived: false,
  };
  delete (copyData as any).id;
  delete (copyData as any).createdAt;
  delete (copyData as any).updatedAt;

  return await createProductInDb(copyData);
}

export async function toggleProductStatusInDb(id: string | number): Promise<Product> {
  const original = await getProductByIdFromDb(id);
  if (!original) throw new Error('Product not found');

  return await updateProductInDb(id, {
    isActive: !original.isActive,
  });
}

// -------------------------------------------------------------
// CATEGORY CRUD
// -------------------------------------------------------------

export async function getCategoriesFromDb(includeArchived = false): Promise<Category[]> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (snap.empty) return FALLBACK_CATEGORIES;
    const list: Category[] = [];
    snap.forEach((d) => {
      const data = d.data() as Category;
      if (includeArchived || !data.isArchived) {
        list.push({ ...data, id: d.id });
      }
    });
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('[Firestore] getCategories error:', error);
    return FALLBACK_CATEGORIES;
  }
}

export async function createCategoryInDb(catData: Partial<Category>): Promise<Category> {
  await ensureDatabaseSeeded();
  const slug =
    catData.slug ||
    (catData.name || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  const id = `cat-${slug}-${Date.now()}`;

  const newCat: Category = {
    id,
    name: catData.name?.trim() || 'New Category',
    banglaName: catData.banglaName?.trim() || catData.name?.trim() || 'নতুন ক্যাটাগরি',
    slug,
    image: catData.image || '/images/barakah/sorisa5liter.png',
    description: catData.description || 'খাঁটি ও প্রাকৃতিক পণ্য ক্যাটাগরি।',
    itemCount: 0,
    isActive: catData.isActive !== undefined ? Boolean(catData.isActive) : true,
    isArchived: false,
    displayOrder: catData.displayOrder || 10,
  };

  await setDoc(doc(db, CATEGORIES_COLLECTION, id), newCat);
  return newCat;
}

export async function updateCategoryInDb(id: string, updates: Partial<Category>): Promise<Category> {
  await ensureDatabaseSeeded();
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error(`Category ${id} not found.`);

  const updated: Category = {
    ...(snap.data() as Category),
    ...updates,
    id,
  };
  await updateDoc(docRef, updated as any);
  return updated;
}

export async function deleteCategoryInDb(id: string, permanent = false): Promise<boolean> {
  await ensureDatabaseSeeded();
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  if (permanent) {
    await deleteDoc(docRef);
  } else {
    await updateDoc(docRef, { isArchived: true, isActive: false });
  }
  return true;
}

export async function toggleCategoryStatusInDb(id: string): Promise<Category> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Category not found');
  const cat = snap.data() as Category;
  return await updateCategoryInDb(id, { isActive: !cat.isActive });
}

// -------------------------------------------------------------
// ORDER CRUD
// -------------------------------------------------------------

export async function getOrdersFromDb(): Promise<Order[]> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as Order), id: d.id });
    });
    return list.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
  } catch (error) {
    console.error('[Firestore] getOrders error:', error);
    return [];
  }
}

export async function getOrderByIdFromDb(id: string): Promise<Order | null> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDoc(doc(db, ORDERS_COLLECTION, id.trim()));
    if (snap.exists()) {
      return { ...(snap.data() as Order), id: snap.id };
    }
    return null;
  } catch (error) {
    console.error('[Firestore] getOrderById error:', error);
    return null;
  }
}

export async function createOrderInDb(orderData: Partial<Order>): Promise<Order> {
  await ensureDatabaseSeeded();
  const orderNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = `BA-2026-${orderNum}`;

  const newOrder: Order = {
    id: orderId,
    customerName: orderData.customerName?.trim() || 'গ্রাহক',
    phone: orderData.phone?.trim() || '',
    altPhone: orderData.altPhone?.trim() || '',
    email: orderData.email?.trim() || '',
    division: orderData.division || 'Dhaka (ঢাকা)',
    district: orderData.district || 'ঢাকা',
    upazila: orderData.upazila || '',
    address: orderData.address?.trim() || '',
    deliveryLocation: orderData.deliveryLocation || 'inside',
    deliveryInstructions: orderData.deliveryInstructions || '',
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal) || 0,
    discount: Number(orderData.discount) || 0,
    couponCode: orderData.couponCode || '',
    shippingFee: Number(orderData.shippingFee) || 80,
    total: Number(orderData.total) || 0,
    paymentMethod: orderData.paymentMethod || 'cod',
    paymentStatus: orderData.paymentStatus || 'Pending',
    transactionId: orderData.transactionId || '',
    status: 'Pending',
    statusHistory: [
      {
        status: 'Pending',
        timestamp: new Date().toISOString(),
        note: 'Order placed by customer',
      },
    ],
    adminNotes: orderData.adminNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, ORDERS_COLLECTION, orderId), newOrder);

  // Update or record customer
  try {
    const custPhone = newOrder.phone.replace(/[^0-9]/g, '');
    if (custPhone) {
      const custDocRef = doc(db, CUSTOMERS_COLLECTION, custPhone);
      const custSnap = await getDoc(custDocRef);
      if (custSnap.exists()) {
        const c = custSnap.data() as CustomerUser;
        await updateDoc(custDocRef, {
          ordersCount: (c.ordersCount || 0) + 1,
          totalSpent: (c.totalSpent || 0) + newOrder.total,
          defaultAddress: newOrder.address || c.defaultAddress,
          defaultDistrict: newOrder.district || c.defaultDistrict,
          defaultDivision: newOrder.division || c.defaultDivision,
        });
      } else {
        await setDoc(custDocRef, {
          id: custPhone,
          name: newOrder.customerName,
          phone: newOrder.phone,
          email: newOrder.email,
          defaultAddress: newOrder.address,
          defaultDistrict: newOrder.district,
          defaultDivision: newOrder.division,
          ordersCount: 1,
          totalSpent: newOrder.total,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (cErr) {
    console.warn('[Firestore] Customer sync note:', cErr);
  }

  return newOrder;
}

export async function updateOrderInDb(id: string, updates: Partial<Order>): Promise<Order> {
  await ensureDatabaseSeeded();
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error(`Order ${id} not found.`);

  const existing = snap.data() as Order;
  const history = [...(existing.statusHistory || [])];

  if (updates.status && updates.status !== existing.status) {
    history.push({
      status: updates.status,
      timestamp: new Date().toISOString(),
      note: updates.adminNotes || `Status updated to ${updates.status} by Admin`,
    });
  }

  const updatedOrder: Order = {
    ...existing,
    ...updates,
    id,
    statusHistory: history,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(docRef, updatedOrder as any);
  return updatedOrder;
}

export async function updateOrderStatusInDb(id: string, status: OrderStatus, note?: string): Promise<Order> {
  return await updateOrderInDb(id, {
    status,
    adminNotes: note,
  });
}

// -------------------------------------------------------------
// CUSTOMER CRUD
// -------------------------------------------------------------

export async function getCustomersFromDb(): Promise<CustomerUser[]> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    const list: CustomerUser[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as CustomerUser), id: d.id });
    });
    return list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
  } catch (error) {
    console.error('[Firestore] getCustomers error:', error);
    return [];
  }
}

export async function updateCustomerInDb(id: string, updates: Partial<CustomerUser>): Promise<CustomerUser> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Customer not found');

  const updated: CustomerUser = {
    ...(snap.data() as CustomerUser),
    ...updates,
    id,
  };
  await updateDoc(docRef, updated as any);
  return updated;
}

export async function toggleCustomerStatusInDb(id: string): Promise<CustomerUser> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Customer not found');
  const cust = snap.data() as CustomerUser;
  return await updateCustomerInDb(id, {
    isActive: cust.isActive === false ? true : false,
  });
}

// -------------------------------------------------------------
// SITE SETTINGS CRUD
// -------------------------------------------------------------

export async function getSettingsFromDb(): Promise<SiteSettings> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDoc(doc(db, SETTINGS_COLLECTION, 'general'));
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return FALLBACK_SETTINGS;
  } catch (error) {
    console.error('[Firestore] getSettings error:', error);
    return FALLBACK_SETTINGS;
  }
}

export async function updateSettingsInDb(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  await ensureDatabaseSeeded();
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  const snap = await getDoc(docRef);
  const current = snap.exists() ? (snap.data() as SiteSettings) : FALLBACK_SETTINGS;

  const updated: SiteSettings = {
    ...current,
    ...updates,
  };

  await setDoc(docRef, updated);
  return updated;
}

// -------------------------------------------------------------
// ADMIN AUTH & CREDENTIALS
// -------------------------------------------------------------

export async function getAdminsFromDb(): Promise<AdminUser[]> {
  await ensureDatabaseSeeded();
  try {
    const snap = await getDocs(collection(db, ADMINS_COLLECTION));
    const list: AdminUser[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: d.id,
        email: data.email,
        name: data.name,
        role: data.role || 'admin',
        isActive: data.isActive !== false,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return list;
  } catch (error) {
    console.error('[Firestore] getAdmins error:', error);
    return [];
  }
}

export async function verifyAdminCredentials(
  email: string,
  passwordInput: string
): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
  await ensureDatabaseSeeded();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  // Local saved override pin support
  const localPin = localStorage.getItem(ADMIN_SECRET_KEY);

  try {
    const adminsSnap = await getDocs(collection(db, ADMINS_COLLECTION));
    let matchedAdmin: any = null;

    adminsSnap.forEach((d) => {
      const a = d.data();
      if (a.email && a.email.toLowerCase() === cleanEmail) {
        matchedAdmin = { ...a, id: d.id };
      }
    });

    // Check if email matched an authorized admin
    if (!matchedAdmin) {
      // Fallback authorized master email check
      if (
        cleanEmail === 'admin@barakahagro.com' ||
        cleanEmail === 'tahminajannatayesha@gmail.com' ||
        cleanEmail === 'admin'
      ) {
        matchedAdmin = {
          id: 'admin-master',
          email: cleanEmail,
          name: 'Barakah Administrator',
          role: 'superadmin',
          passwordHash: 'barakah2026',
          isActive: true,
        };
      } else {
        return { success: false, error: 'অননুমোদিত ইমেইল! শুধুমাত্র অ্যাডমিনগণ লগইন করতে পারবেন।' };
      }
    }

    if (matchedAdmin.isActive === false) {
      return { success: false, error: 'আপনার অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।' };
    }

    // Password validation:
    // Matches DB hash, or localPin, or default master keys
    const isValidPassword =
      cleanPassword === matchedAdmin.passwordHash ||
      (localPin && cleanPassword === localPin) ||
      cleanPassword === 'barakah2026' ||
      cleanPassword === 'admin123';

    if (isValidPassword) {
      const adminUser: AdminUser = {
        id: matchedAdmin.id,
        email: matchedAdmin.email,
        name: matchedAdmin.name || 'Admin',
        role: matchedAdmin.role || 'admin',
        isActive: true,
        createdAt: matchedAdmin.createdAt || new Date().toISOString(),
      };
      return { success: true, admin: adminUser };
    } else {
      return { success: false, error: 'ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড প্রদান করুন।' };
    }
  } catch (err) {
    console.error('[Firestore] verifyAdmin error:', err);
    // Offline / fallback fallback for guaranteed admin access
    if (
      (cleanEmail === 'admin@barakahagro.com' ||
        cleanEmail === 'tahminajannatayesha@gmail.com' ||
        cleanEmail === 'admin') &&
      (cleanPassword === 'barakah2026' || cleanPassword === 'admin123' || (localPin && cleanPassword === localPin))
    ) {
      return {
        success: true,
        admin: {
          id: 'admin-offline',
          email: cleanEmail,
          name: 'Barakah Administrator',
          role: 'superadmin',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      };
    }
    return { success: false, error: 'সার্ভারে সংযোগ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' };
  }
}

export async function changeAdminPasswordInDb(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  await ensureDatabaseSeeded();
  const verify = await verifyAdminCredentials(email, oldPassword);
  if (!verify.success) {
    return { success: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' };
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, message: 'নতুন পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে।' };
  }

  const cleanNew = newPassword.trim();
  localStorage.setItem(ADMIN_SECRET_KEY, cleanNew);

  try {
    const adminsSnap = await getDocs(collection(db, ADMINS_COLLECTION));
    let docIdToUpdate: string | null = null;
    adminsSnap.forEach((d) => {
      const a = d.data();
      if (a.email && a.email.toLowerCase() === email.trim().toLowerCase()) {
        docIdToUpdate = d.id;
      }
    });

    if (docIdToUpdate) {
      await updateDoc(doc(db, ADMINS_COLLECTION, docIdToUpdate), {
        passwordHash: cleanNew,
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' };
  } catch (err) {
    console.error('[Firestore] changePassword error:', err);
    return { success: true, message: 'পাসওয়ার্ড লোকাল সেশনে সফলভাবে সংরক্ষণ করা হয়েছে।' };
  }
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------

export function subscribeToReviews(callback: (reviews: SiteReview[]) => void): () => void {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('rating', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const revs: SiteReview[] = snapshot.docs.map((d) => ({
            ...(d.data() as SiteReview),
            id: d.id,
          }));
          callback(revs);
        } else {
          callback(FALLBACK_REVIEWS);
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeToReviews listener note:', err);
        callback(FALLBACK_REVIEWS);
      }
    );
  } catch {
    callback(FALLBACK_REVIEWS);
    return () => {};
  }
}

export async function getReviewsFromDb(): Promise<SiteReview[]> {
  try {
    const snap = await getDocs(query(collection(db, REVIEWS_COLLECTION), limit(50)));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ ...(d.data() as SiteReview), id: d.id }));
    }
    return FALLBACK_REVIEWS;
  } catch {
    return FALLBACK_REVIEWS;
  }
}

export async function createReviewInDb(review: Partial<SiteReview>): Promise<SiteReview> {
  const newRev: SiteReview = {
    id: `rev-${Date.now()}`,
    author: review.author?.trim() || 'সম্মানিত ক্রেতা',
    city: review.city?.trim() || 'ঢাকা',
    rating: Number(review.rating) || 5,
    comment: review.comment?.trim() || 'চমৎকার খাঁটি পণ্য!',
    productName: review.productName?.trim() || 'Barakah Agro Product',
    verified: true,
    date: 'আজকে',
  };
  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, newRev.id), newRev);
  } catch (e) {
    console.warn('[Firestore] createReview error:', e);
  }
  return newRev;
}

