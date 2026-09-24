import { Router } from 'express';
import { getDb, saveDb } from './db';
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
} from '../src/types/ecommerce';

const router = Router();

// ==========================================
// 1. PRODUCTS
// ==========================================

router.get('/products', (req, res) => {
  try {
    const db = getDb();
    let products = [...db.products];

    const { category, search, badge, sort, limit } = req.query;

    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(
        (p) =>
          p.categorySlug.toLowerCase() === category.toLowerCase() ||
          p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (badge && typeof badge === 'string') {
      if (badge === 'isOffer') {
        products = products.filter((p) => p.isOffer || (p.badges && p.badges.includes('OFFER')));
      } else if (badge === 'isFeatured') {
        products = products.filter((p) => p.isFeatured);
      } else {
        products = products.filter((p) => p.badges && p.badges.includes(badge as any));
      }
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort && typeof sort === 'string') {
      switch (sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          products.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case 'latest':
        default:
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    if (limit && typeof limit === 'string') {
      const n = parseInt(limit, 10);
      if (!isNaN(n) && n > 0) {
        products = products.slice(0, n);
      }
    }

    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/products/:idOrSlug', (req, res) => {
  try {
    const db = getDb();
    const { idOrSlug } = req.params;
    const product = db.products.find(
      (p) => String(p.id) === idOrSlug || p.slug === idOrSlug
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/products', (req, res) => {
  try {
    const db = getDb();
    const newProduct: Product = {
      ...req.body,
      id: Date.now(),
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDb(db);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const index = db.products.findIndex((p) => String(p.id) === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    db.products[index] = { ...db.products[index], ...req.body };
    saveDb(db);
    res.json({ success: true, product: db.products[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const beforeCount = db.products.length;
    db.products = db.products.filter((p) => String(p.id) !== id);

    if (db.products.length === beforeCount) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    saveDb(db);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. CATEGORIES
// ==========================================

router.get('/categories', (_req, res) => {
  try {
    const db = getDb();
    // compute item counts dynamically
    const categoriesWithCount = db.categories.map((c) => ({
      ...c,
      itemCount: db.products.filter(
        (p) =>
          p.categorySlug.toLowerCase() === c.slug.toLowerCase() ||
          p.category.toLowerCase() === c.name.toLowerCase()
      ).length,
    }));
    res.json({ success: true, categories: categoriesWithCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/categories', (req, res) => {
  try {
    const db = getDb();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: req.body.name,
      banglaName: req.body.banglaName || req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: req.body.description || '',
      image: req.body.image || '/images/barakah/logo.jpeg',
      itemCount: 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      displayOrder: db.categories.length + 1,
    };

    db.categories.push(newCategory);
    saveDb(db);
    res.status(201).json({ success: true, category: newCategory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/categories/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const index = db.categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    db.categories[index] = { ...db.categories[index], ...req.body };
    saveDb(db);
    res.json({ success: true, category: db.categories[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDb(db);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ORDERS
// ==========================================

router.get('/orders', (req, res) => {
  try {
    const db = getDb();
    let orders = [...db.orders];
    const { status, search, phone } = req.query;

    if (status && typeof status === 'string' && status !== 'all') {
      orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }

    if (phone && typeof phone === 'string') {
      orders = orders.filter((o) => o.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.address.toLowerCase().includes(q)
      );
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Customer order tracking endpoint
router.get('/orders/track', (req, res) => {
  try {
    const db = getDb();
    const { orderId, phone } = req.query;

    if (!orderId || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both Order ID and Phone Number',
      });
    }

    const cleanOrderId = String(orderId).trim().toUpperCase();
    const cleanPhone = String(phone).replace(/\D/g, '');

    const order = db.orders.find(
      (o) =>
        o.id.toUpperCase() === cleanOrderId &&
        o.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'No matching order found for this Order ID and Phone number.',
      });
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/orders', (req, res) => {
  try {
    const db = getDb();
    const {
      customerName,
      phone,
      email,
      division,
      district,
      upazila,
      address,
      deliveryLocation,
      deliveryInstructions,
      items,
      subtotal,
      discount,
      couponCode,
      shippingFee,
      total,
      paymentMethod,
      transactionId,
    } = req.body;

    if (!customerName || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required customer details and order items.',
      });
    }

    // Generate readable Order ID: e.g. BA-2026-000104
    const orderNumber = 100 + db.orders.length + 1;
    const orderId = `BA-2026-000${orderNumber}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      customerName,
      phone,
      email: email || '',
      division: division || 'Dhaka',
      district: district || 'Dhaka',
      upazila: upazila || '',
      address,
      deliveryLocation: deliveryLocation || 'inside',
      deliveryInstructions: deliveryInstructions || '',
      items,
      subtotal: Number(subtotal),
      discount: Number(discount) || 0,
      couponCode: couponCode || undefined,
      shippingFee: Number(shippingFee),
      total: Number(total),
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : transactionId ? 'Paid' : 'Pending',
      transactionId: transactionId || undefined,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'অর্ডারটি সফলভাবে সাবমিট হয়েছে।',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Update coupon usage if used
    if (couponCode) {
      const coupon = db.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.toUpperCase()
      );
      if (coupon) {
        coupon.usageCount += 1;
      }
    }

    // Update or insert customer
    const existingCust = db.customers.find(
      (c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
    );
    if (existingCust) {
      existingCust.ordersCount = (existingCust.ordersCount || 1) + 1;
      existingCust.totalSpent = (existingCust.totalSpent || 0) + newOrder.total;
    } else {
      db.customers.push({
        id: `cust-${Date.now()}`,
        name: customerName,
        phone,
        email: email || undefined,
        defaultAddress: address,
        defaultDistrict: district,
        defaultDivision: division,
        createdAt: now,
        ordersCount: 1,
        totalSpent: newOrder.total,
      });
    }

    // Stock decrement
    for (const item of items) {
      const p = db.products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - (item.quantity || 1));
      }
    }

    db.orders.unshift(newOrder);
    saveDb(db);

    res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status
router.put('/orders/:id/status', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { status, note } = req.body as { status: OrderStatus; note?: string };

    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const now = new Date().toISOString();
    order.status = status;
    order.updatedAt = now;
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status,
      timestamp: now,
      note: note || `Status changed to ${status}`,
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    saveDb(db);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update full order details
router.put('/orders/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const index = db.orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    db.orders[index] = {
      ...db.orders[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);
    res.json({ success: true, order: db.orders[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. COUPONS
// ==========================================

router.get('/coupons', (_req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, coupons: db.coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/coupons/validate', (req, res) => {
  try {
    const db = getDb();
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Please enter a coupon code.' });
    }

    const coupon = db.coupons.find(
      (c) => c.code.toUpperCase() === String(code).trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive coupon code.' });
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      return res.status(400).json({ success: false, error: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit exceeded.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        error: `Minimum order of ৳${coupon.minSpend} required for this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/coupons', (req, res) => {
  try {
    const db = getDb();
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: req.body.code.toUpperCase().trim(),
      discountType: req.body.discountType || 'percentage',
      discountValue: Number(req.body.discountValue),
      minSpend: Number(req.body.minSpend) || 0,
      maxDiscount: req.body.maxDiscount ? Number(req.body.maxDiscount) : undefined,
      expiryDate: req.body.expiryDate || '2027-12-31',
      usageLimit: Number(req.body.usageLimit) || 1000,
      usageCount: 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };

    db.coupons.push(newCoupon);
    saveDb(db);
    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/coupons/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const idx = db.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Coupon not found' });
    db.coupons[idx] = { ...db.coupons[idx], ...req.body };
    saveDb(db);
    res.json({ success: true, coupon: db.coupons[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/coupons/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    db.coupons = db.coupons.filter((c) => c.id !== id);
    saveDb(db);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. SHIPPING & SETTINGS
// ==========================================

router.get('/shipping', (_req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, shipping: db.shipping });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/shipping', (req, res) => {
  try {
    const db = getDb();
    db.shipping = { ...db.shipping, ...req.body };
    saveDb(db);
    res.json({ success: true, shipping: db.shipping });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/settings', (_req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, settings: db.settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/settings', (req, res) => {
  try {
    const db = getDb();
    db.settings = { ...db.settings, ...req.body };
    saveDb(db);
    res.json({ success: true, settings: db.settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. REVIEWS
// ==========================================

router.get('/reviews', (_req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, reviews: db.reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reviews', (req, res) => {
  try {
    const db = getDb();
    const newReview: SiteReview = {
      id: `rev-${Date.now()}`,
      author: req.body.author,
      city: req.body.city || 'ঢাকা',
      rating: Number(req.body.rating) || 5,
      comment: req.body.comment,
      productName: req.body.productName,
      verified: true,
      date: new Date().toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    db.reviews.unshift(newReview);
    saveDb(db);
    res.status(201).json({ success: true, review: newReview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. CUSTOMERS
// ==========================================

router.get('/customers', (_req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, customers: db.customers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. ADMIN STATS
// ==========================================

router.get('/admin/stats', (_req, res) => {
  try {
    const db = getDb();
    const totalSales = db.orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = db.orders
      .filter((o) => o.status !== 'Cancelled' && o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = db.orders.filter((o) => o.status === 'Pending').length;
    const processingOrders = db.orders.filter(
      (o) => o.status === 'Processing' || o.status === 'Confirmed' || o.status === 'Packed'
    ).length;
    const deliveredOrders = db.orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = db.orders.filter((o) => o.status === 'Cancelled').length;
    const lowStockProducts = db.products.filter((p) => p.stock < 20);

    // Sales over last 7 days
    const dailyBreakdown: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayOrders = db.orders.filter(
        (o) => o.status !== 'Cancelled' && o.createdAt.slice(0, 10) === dateKey
      );
      dailyBreakdown.push({
        date: dateKey,
        sales: dayOrders.reduce((acc, o) => acc + o.total, 0),
        orders: dayOrders.length,
      });
    }

    res.json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders: db.orders.length,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers: db.customers.length,
        totalProducts: db.products.length,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        dailyBreakdown,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
