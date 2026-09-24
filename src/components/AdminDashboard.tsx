import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Percent,
  Truck,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Printer,
  RefreshCw,
  EyeOff,
  Lock,
  ShieldCheck,
  Globe,
  Sparkles,
  Tag,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Layers,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToOrders,
  subscribeToSettings,
  subscribeToCustomers,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  duplicateProductInDb,
  toggleProductStatusInDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  toggleCategoryStatusInDb,
  updateOrderInDb,
  updateOrderStatusInDb,
  updateCustomerInDb,
  toggleCustomerStatusInDb,
  updateSettingsInDb,
} from '../services/firestoreService';
import type {
  Product,
  Category,
  Order,
  OrderStatus,
  Coupon,
  ShippingZoneConfig,
  CustomerUser,
  SiteSettings,
} from '../types/ecommerce';
import { ProductFormModal } from './admin/ProductFormModal';
import { ProductDeleteModal } from './admin/ProductDeleteModal';
import { OrderEditModal } from './admin/OrderEditModal';
import { CategoryModal } from './admin/CategoryModal';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'content'
  | 'security';

interface AdminDashboardProps {
  initialTab?: AdminTab;
  onLogout: () => void;
  onViewStore: () => void;
  onNavigateTab?: (tab: AdminTab, path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'overview',
  onLogout,
  onViewStore,
  onNavigateTab,
}) => {
  const { adminUser, logoutAdmin, changeAdminPassword } = useAuth();

  // Active Tab state synced with URL
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Firestore real-time data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [productSort, setProductSort] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'stock' | 'name'>('newest');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');

  const [customerSearch, setCustomerSearch] = useState('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);

  // Notification toast message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Content Settings Form local state
  const [contentFormData, setContentFormData] = useState<Partial<SiteSettings>>({});

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // URL path mapping
  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
    let path = '/admin';
    if (tab === 'products') path = '/admin/products';
    else if (tab === 'categories') path = '/admin/categories';
    else if (tab === 'orders') path = '/admin/orders';
    else if (tab === 'customers') path = '/admin/customers';
    else if (tab === 'content') path = '/admin/content';
    else if (tab === 'security') path = '/admin/security';

    window.history.pushState({ tab }, '', path);
    if (onNavigateTab) onNavigateTab(tab, path);
  };

  // 1. Subscribe to Firestore Collections
  useEffect(() => {
    setLoading(true);

    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setLoading(false);
    }, true); // Include archived for admin view

    const unsubCategories = subscribeToCategories((cats) => {
      setCategories(cats);
    }, true);

    const unsubOrders = subscribeToOrders((ords) => {
      setOrders(ords);
    });

    const unsubCustomers = subscribeToCustomers((custs) => {
      setCustomers(custs);
    });

    const unsubSettings = subscribeToSettings((sett) => {
      setSettings(sett);
      setContentFormData(sett);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubCustomers();
      unsubSettings();
    };
  }, []);

  // Handle open add product directly if path is /admin/products/new
  useEffect(() => {
    if (window.location.pathname === '/admin/products/new') {
      setActiveTab('products');
      setEditingProduct(null);
      setIsProductModalOpen(true);
    }
  }, []);

  // Listen to browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/products' || path === '/admin/products/new') {
        setActiveTab('products');
        if (path === '/admin/products/new') {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }
      } else if (path === '/admin/categories') {
        setActiveTab('categories');
      } else if (path === '/admin/orders') {
        setActiveTab('orders');
      } else if (path === '/admin/customers') {
        setActiveTab('customers');
      } else if (path === '/admin/content') {
        setActiveTab('content');
      } else {
        setActiveTab('overview');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // -------------------------------------------------------------
  // COMPUTED DASHBOARD METRICS
  // -------------------------------------------------------------
  const activeProductsCount = products.filter((p) => !p.isArchived && p.isActive).length;
  const outOfStockCount = products.filter((p) => !p.isArchived && p.stock <= 0).length;
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
  const totalCustomersCount = customers.length || Math.max(orders.length, 1);
  const totalSalesAmount = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // -------------------------------------------------------------
  // PRODUCT MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        // Edit existing product
        await updateProductInDb(editingProduct.id, productData);
        showToast(`'${productData.name}' পণ্যটি সফলভাবে আপডেট করা হয়েছে।`);
      } else {
        // Add new product
        const created = await createProductInDb(productData);
        showToast(`'${created.name}' পণ্যটি সফলভাবে তৈরি ও স্টোরফ্রন্টে যুক্ত করা হয়েছে!`);
      }
    } catch (err: any) {
      showToast(err?.message || 'পণ্য সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleArchiveProduct = async (prod: Product) => {
    try {
      await deleteProductFromDb(prod.id, false);
      showToast(`'${prod.name}' পণ্যটি মুছে/আর্কাইভ করা হয়েছে এবং স্টোরফ্রন্ট থেকে সরানো হয়েছে।`);
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const handlePermanentDeleteProduct = async (prod: Product) => {
    try {
      await deleteProductFromDb(prod.id, true);
      showToast(`'${prod.name}' স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে।`);
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    try {
      const cloned = await duplicateProductInDb(prod.id);
      showToast(`'${prod.name}' সফলভাবে ক্লোন করা হয়েছে: '${cloned.name}'`);
    } catch (err: any) {
      showToast(err?.message || 'ক্লোন করতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleToggleProductStatus = async (prod: Product) => {
    try {
      const updated = await toggleProductStatusInDb(prod.id);
      showToast(
        `'${prod.name}' এখন ${updated.isActive ? 'অ্যাক্টিভ (স্টোরে দৃশ্যমান)' : 'নিষ্ক্রিয় (হাইড করা হয়েছে)'}`
      );
    } catch (err: any) {
      showToast(err?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ', 'error');
    }
  };

  const handleRestoreProduct = async (prod: Product) => {
    try {
      await updateProductInDb(prod.id, { isArchived: false, isActive: true });
      showToast(`'${prod.name}' পুনরায় রিস্টোর করে অ্যাক্টিভ করা হয়েছে।`);
    } catch (err: any) {
      showToast(err?.message || 'রিস্টোর করতে সমস্যা হয়েছে', 'error');
    }
  };

  // -------------------------------------------------------------
  // CATEGORY ACTIONS
  // -------------------------------------------------------------
  const handleSaveCategory = async (catData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategoryInDb(editingCategory.id, catData);
        showToast(`'${catData.name}' ক্যাটাগরি আপডেট করা হয়েছে।`);
      } else {
        await createCategoryInDb(catData);
        showToast(`নতুন ক্যাটাগরি '${catData.name}' যুক্ত হয়েছে।`);
      }
    } catch (err: any) {
      showToast(err?.message || 'ক্যাটাগরি সংরক্ষণ ব্যর্থ', 'error');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে '${cat.banglaName || cat.name}' ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
      try {
        await deleteCategoryInDb(cat.id, false);
        showToast(`ক্যাটাগরি '${cat.name}' মুছে ফেলা হয়েছে।`);
      } catch (err: any) {
        showToast(err?.message || 'মুছে ফেলতে সমস্যা হয়েছে', 'error');
      }
    }
  };

  const handleToggleCategory = async (cat: Category) => {
    try {
      const updated = await toggleCategoryStatusInDb(cat.id);
      showToast(`ক্যাটাগরি '${cat.name}' এখন ${updated.isActive ? 'অ্যাক্টিভ' : 'নিষ্ক্রিয়'}`);
    } catch (err: any) {
      showToast(err?.message || 'ক্যাটাগরি স্ট্যাটাস পরিবর্তন ব্যর্থ', 'error');
    }
  };

  // -------------------------------------------------------------
  // ORDER ACTIONS
  // -------------------------------------------------------------
  const handleSaveOrder = async (id: string, updates: Partial<Order>) => {
    try {
      await updateOrderInDb(id, updates);
      showToast(`অর্ডার ${id} সফলভাবে সংরক্ষণ করা হয়েছে।`);
    } catch (err: any) {
      showToast(err?.message || 'অর্ডার আপডেট ব্যর্থ', 'error');
    }
  };

  const handleQuickStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatusInDb(id, status);
      showToast(`অর্ডার ${id} স্ট্যাটাস '${status}' হিসেবে সংরক্ষিত হয়েছে।`);
    } catch (err: any) {
      showToast(err?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ', 'error');
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER ACTIONS
  // -------------------------------------------------------------
  const handleToggleCustomer = async (cust: CustomerUser) => {
    try {
      const updated = await toggleCustomerStatusInDb(cust.id);
      showToast(`গ্রাহক ${cust.name} অ্যাকাউন্ট এখন ${updated.isActive ? 'সক্রিয়' : 'স্থগিত (Suspended)'}`);
    } catch (err: any) {
      showToast(err?.message || 'গ্রাহক স্ট্যাটাস আপডেট ব্যর্থ', 'error');
    }
  };

  // -------------------------------------------------------------
  // CONTENT SETTINGS SAVE
  // -------------------------------------------------------------
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsInDb(contentFormData);
      showToast('ওয়েবসাইট কন্টেন্ট ও সেটিংস ডাটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (err: any) {
      showToast(err?.message || 'সেটিংস সংরক্ষণ ব্যর্থ', 'error');
    }
  };

  // -------------------------------------------------------------
  // PASSWORD CHANGE
  // -------------------------------------------------------------
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('নতুন পাসওয়ার্ড দুটি মিলছে না!', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await changeAdminPassword(oldPassword, newPassword);
      if (res.success) {
        showToast(res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FILTERED PRODUCTS
  // -------------------------------------------------------------
  const filteredProducts = products.filter((prod) => {
    // Search
    const q = productSearch.toLowerCase();
    const matchesSearch =
      !q ||
      prod.name.toLowerCase().includes(q) ||
      (prod.banglaName && prod.banglaName.toLowerCase().includes(q)) ||
      (prod.sku && prod.sku.toLowerCase().includes(q));

    // Category
    const matchesCat =
      selectedProductCategory === 'all' ||
      prod.category === selectedProductCategory ||
      prod.categorySlug === selectedProductCategory;

    // Stock
    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = prod.stock > 10;
    else if (stockFilter === 'low_stock') matchesStock = prod.stock > 0 && prod.stock <= 10;
    else if (stockFilter === 'out_of_stock') matchesStock = prod.stock <= 0;

    // Status
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = !prod.isArchived && prod.isActive;
    else if (statusFilter === 'inactive') matchesStatus = !prod.isArchived && !prod.isActive;
    else if (statusFilter === 'archived') matchesStatus = Boolean(prod.isArchived);

    return matchesSearch && matchesCat && matchesStock && matchesStatus;
  });

  // Sort filtered products
  filteredProducts.sort((a, b) => {
    if (productSort === 'newest') return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
    if (productSort === 'oldest') return (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0);
    if (productSort === 'price_asc') return a.price - b.price;
    if (productSort === 'price_desc') return b.price - a.price;
    if (productSort === 'stock') return a.stock - b.stock;
    if (productSort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // -------------------------------------------------------------
  // FILTERED ORDERS
  // -------------------------------------------------------------
  const filteredOrders = orders.filter((ord) => {
    const q = orderSearch.toLowerCase();
    const matchesSearch =
      !q ||
      ord.id.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.phone.includes(q);

    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const matchesPayment = orderPaymentFilter === 'all' || ord.paymentStatus === orderPaymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // -------------------------------------------------------------
  // FILTERED CUSTOMERS
  // -------------------------------------------------------------
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform duration-200 animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 shadow-rose-950/40'
              : toastMessage.type === 'info'
              ? 'bg-blue-600 shadow-blue-950/40'
              : 'bg-emerald-700 shadow-emerald-950/40'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  বারাকাহ এগ্রো অ্যাডমিন প্যানেল
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  LIVE DATABASE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                অ্যাডমিন: {adminUser?.email || 'admin@barakahagro.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewStore}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Globe size={14} className="text-emerald-700" />
              <span className="hidden sm:inline">স্টোর দেখুন (Storefront)</span>
              <ExternalLink size={12} className="text-slate-400" />
            </button>

            <button
              onClick={logoutAdmin}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="লগআউট করুন"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto flex gap-1 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => switchTab('overview')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={15} />
            ড্যাশবোর্ড (Dashboard)
          </button>

          <button
            onClick={() => switchTab('products')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'products'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package size={15} />
            পণ্য ব্যবস্থাপনা (Products)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('categories')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'categories'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers size={15} />
            ক্যাটাগরি (Categories)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('orders')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'orders'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag size={15} />
            অর্ডার সমূহ (Orders)
            {pendingOrdersCount > 0 && (
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('customers')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'customers'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users size={15} />
            গ্রাহক তালিকা (Customers)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('content')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'content'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings size={15} />
            ওয়েবসাইট কন্টেন্ট (Content)
          </button>

          <button
            onClick={() => switchTab('security')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'security'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Lock size={15} />
            নিরাপত্তা ও পাসওয়ার্ড (Security)
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD (/admin) */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Products */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">মোট পণ্য (Total Products)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {products.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>সক্রিয়: {activeProductsCount} টি</span>
                  <span className="text-rose-600 font-semibold">স্টক শেষ: {outOfStockCount} টি</span>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">মোট অর্ডার (Total Orders)</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {totalOrdersCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span className="text-amber-700 font-semibold">অপেক্ষমান: {pendingOrdersCount}</span>
                  <span className="text-emerald-700 font-semibold">ডেলিভার্ড: {completedOrdersCount}</span>
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">মোট গ্রাহক (Total Customers)</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {totalCustomersCount}
                </div>
                <div className="text-[11px] text-purple-700 font-semibold mt-1">
                  নিবন্ধিত ও ক্রেতা ডাটাবেজ
                </div>
              </div>

              {/* Total Sales */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">মোট বিক্রি (Total Sales)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <BarChart3 size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-900 tabular-nums">
                  ৳ {totalSalesAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  সফল ডেলিভারি ও রানিং অর্ডার
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">কুইক একশন ও শর্টকাট</h3>
                <p className="text-xs text-slate-500">ডাটাবেজে দ্রুত পণ্য বা অর্ডার যোগ করুন</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={15} />
                  নতুন পণ্য যোগ করুন (Add Product)
                </button>

                <button
                  onClick={() => switchTab('orders')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <ShoppingBag size={15} />
                  অর্ডার তালিকা দেখুন
                </button>

                <button
                  onClick={() => switchTab('content')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings size={15} />
                  ওয়েবসাইট কন্টেন্ট এডিট
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">সাম্প্রতিক অর্ডার সমূহ (Recent Orders)</h3>
                  <p className="text-xs text-slate-500">সর্বশেষ গ্রাহক অর্ডার ও ডেলিভারি স্ট্যাটাস</p>
                </div>
                <button
                  onClick={() => switchTab('orders')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  সবগুলো দেখুন ({orders.length}) <ChevronDown size={14} className="-rotate-90" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">অর্ডার আইডি</th>
                      <th className="p-3.5">গ্রাহকের নাম ও ফোন</th>
                      <th className="p-3.5">তারিখ</th>
                      <th className="p-3.5">সর্বমোট (৳)</th>
                      <th className="p-3.5">পেমেন্ট</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-500">{ord.phone}</div>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-3.5 font-extrabold text-slate-900 tabular-nums">
                          ৳ {ord.total}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setIsOrderModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Eye size={14} />
                            <span>ডিটেইলস</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTS MANAGEMENT (/admin/products) */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Search & Filters Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="নাম, বাংলা নাম বা SKU কোড দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                  <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Add Product Button */}
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>নতুন পণ্য যোগ করুন (Add Product)</span>
                </button>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                {/* Category Filter */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্যাটাগরি ফিল্টার</label>
                  <select
                    value={selectedProductCategory}
                    onChange={(e) => setSelectedProductCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="all">সবগুলো ক্যাটাগরি ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.banglaName || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">স্টক ফিল্টার</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="all">সকল স্টক অবস্থা</option>
                    <option value="in_stock">ইন স্টক (&gt; 10)</option>
                    <option value="low_stock">লো স্টক (1-10)</option>
                    <option value="out_of_stock">স্টক শেষ (0)</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">স্ট্যাটাস ফিল্টার</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="all">সকল স্ট্যাটাস</option>
                    <option value="active">অ্যাক্টিভ (Storefront Live)</option>
                    <option value="inactive">নিষ্ক্রিয় (Hidden)</option>
                    <option value="archived">আর্কাইভ / ডিলিটেড</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">সাজান (Sorting)</label>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="newest">সর্বশেষ যুক্ত (Newest)</option>
                    <option value="oldest">পুরাতন (Oldest)</option>
                    <option value="price_asc">মূল্য: কম থেকে বেশি</option>
                    <option value="price_desc">মূল্য: বেশি থেকে কম</option>
                    <option value="stock">স্টক পরিমাণ</option>
                    <option value="name">নাম (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  প্রদর্শিত পণ্য: <strong>{filteredProducts.length}</strong> টি (মোট {products.length} টির মধ্যে)
                </span>
                {statusFilter === 'archived' && (
                  <span className="text-amber-700 font-semibold">
                    * আর্কাইভ করা পণ্য স্টোরফ্রন্টে প্রদর্শিত হয় না
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">ছবি ও পণ্যের নাম</th>
                      <th className="p-3.5">ক্যাটাগরি</th>
                      <th className="p-3.5">বিক্রয় মূল্য</th>
                      <th className="p-3.5">ছাড় মূল্য</th>
                      <th className="p-3.5">স্টক</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5">ব্যাজ সমূহ</th>
                      <th className="p-3.5 text-right">একশন (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400">
                          কোনো পণ্য পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr
                          key={prod.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            prod.isArchived ? 'opacity-60 bg-slate-50/40' : ''
                          }`}
                        >
                          {/* Image & Title */}
                          <td className="p-3.5 flex items-center gap-3 min-w-[220px]">
                            <img
                              src={prod.image}
                              alt=""
                              className="w-12 h-12 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/barakah/logo.jpeg';
                              }}
                            />
                            <div className="overflow-hidden">
                              <div className="font-bold text-slate-900 truncate">
                                {prod.banglaName || prod.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{prod.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">SKU: {prod.sku}</div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-3.5 text-slate-600 whitespace-nowrap font-medium">
                            {prod.category}
                          </td>

                          {/* Price */}
                          <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                            ৳ {prod.price}
                          </td>

                          {/* Old Price */}
                          <td className="p-3.5 text-slate-400 line-through whitespace-nowrap tabular-nums">
                            {prod.oldPrice ? `৳ ${prod.oldPrice}` : '-'}
                          </td>

                          {/* Stock */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                prod.stock <= 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : prod.stock <= 10
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {prod.stock <= 0 ? 'স্টক শেষ (0)' : `${prod.stock} পিস`}
                            </span>
                          </td>

                          {/* Active / Inactive Status */}
                          <td className="p-3.5 whitespace-nowrap">
                            {prod.isArchived ? (
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                আর্কাইভ্ড
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleProductStatus(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                  prod.isActive
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                                title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                              >
                                {prod.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                {prod.isActive ? 'অ্যাক্টিভ' : 'নিষ্ক্রিয়'}
                              </button>
                            )}
                          </td>

                          {/* Badges */}
                          <td className="p-3.5 whitespace-nowrap space-x-1">
                            {prod.isFeatured && (
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                                ফিচার্ড
                              </span>
                            )}
                            {prod.isBestSeller && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                বেস্ট সেলার
                              </span>
                            )}
                            {prod.isNewArrival && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                নতুন
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* EDIT */}
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="সম্পাদনা করুন (Edit)"
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* DUPLICATE */}
                              <button
                                onClick={() => handleDuplicateProduct(prod)}
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="ক্লোন / ডুপ্লিকেট করুন (Duplicate)"
                              >
                                <Copy size={15} />
                              </button>

                              {/* DELETE / RESTORE */}
                              {prod.isArchived ? (
                                <button
                                  onClick={() => handleRestoreProduct(prod)}
                                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-bold text-[10px]"
                                  title="রিস্টোর করুন"
                                >
                                  রিস্টোর
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteModalProduct(prod)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="মুছে ফেলুন (Delete)"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CATEGORIES MANAGEMENT (/admin/categories) */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-slate-900">ক্যাটাগরি ব্যবস্থাপনা (Categories)</h3>
                <p className="text-xs text-slate-500">
                  ওয়েবসাইটের পণ্য ক্যাটাগরি তৈরি, ছবি পরিবর্তন ও সক্রিয় করুন
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>নতুন ক্যাটাগরি তৈরি করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => !p.isArchived && (p.category === cat.name || p.categorySlug === cat.slug)
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.image}
                        alt=""
                        className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/barakah/sorisa5liter.png';
                        }}
                      />
                      <div className="overflow-hidden flex-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {cat.banglaName || cat.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{cat.name}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {count} টি পণ্য আছে
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                      {cat.description || 'খাঁটি ও প্রাকৃতিক পণ্য ক্যাটাগরি।'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat.isActive ? 'অ্যাক্টিভ' : 'নিষ্ক্রিয়'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ORDERS MANAGEMENT (/admin/orders) */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="অর্ডার আইডি, গ্রাহক নাম বা ফোন খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
                <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="all">সকল অর্ডার স্ট্যাটাস</option>
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered (সম্পন্ন)</option>
                  <option value="Cancelled">Cancelled (বাতিল)</option>
                </select>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="all">সকল পেমেন্ট</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">অর্ডার আইডি</th>
                      <th className="p-3.5">গ্রাহক ও ফোন</th>
                      <th className="p-3.5">ঠিকানা</th>
                      <th className="p-3.5">তারিখ</th>
                      <th className="p-3.5">মোট প্রদেয়</th>
                      <th className="p-3.5">পেমেন্ট</th>
                      <th className="p-3.5">স্ট্যাটাস পরিবর্তন</th>
                      <th className="p-3.5 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400">
                          কোনো অর্ডার পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {ord.id}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{ord.customerName}</div>
                            <div className="text-[11px] text-slate-500">{ord.phone}</div>
                          </td>
                          <td className="p-3.5 max-w-xs truncate text-slate-600">
                            {ord.address}, {ord.district}
                          </td>
                          <td className="p-3.5 text-slate-500 whitespace-nowrap">
                            {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                          </td>
                          <td className="p-3.5 font-extrabold text-slate-900 whitespace-nowrap tabular-nums">
                            ৳ {ord.total}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleQuickStatusChange(ord.id, e.target.value as OrderStatus)
                              }
                              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsOrderModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 size={13} />
                              <span>ইনভয়েস / এডিট</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CUSTOMERS MANAGEMENT (/admin/customers) */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">সম্মানিত গ্রাহক তালিকা (Customer Directory)</h3>
                <p className="text-xs text-slate-500">গ্রাহকদের অ্যাকাউন্ট বিবরণ ও অর্ডার ইতিহাস</p>
              </div>

              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
                <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">গ্রাহকের নাম</th>
                      <th className="p-3.5">ফোন নম্বর</th>
                      <th className="p-3.5">ইমেইল</th>
                      <th className="p-3.5">সংরক্ষিত ঠিকানা</th>
                      <th className="p-3.5">অর্ডার সংখ্যা</th>
                      <th className="p-3.5">মোট কেনাকাটা (৳)</th>
                      <th className="p-3.5">অ্যাকাউন্ট স্ট্যাটাস</th>
                      <th className="p-3.5 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400">
                          কোনো গ্রাহক রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{c.name}</td>
                          <td className="p-3.5 text-slate-600 font-medium whitespace-nowrap">{c.phone}</td>
                          <td className="p-3.5 text-slate-500">{c.email || '-'}</td>
                          <td className="p-3.5 text-slate-600 max-w-xs truncate">
                            {c.defaultAddress || '-'}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                            {c.ordersCount || 0} টি
                          </td>
                          <td className="p-3.5 font-extrabold text-emerald-800 tabular-nums">
                            ৳ {c.totalSpent || 0}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                c.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {c.isActive !== false ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleCustomer(c)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              {c.isActive !== false ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CONTENT MANAGEMENT (/admin/content) */}
        {/* ========================================================= */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveContent} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">ওয়েবসাইট কন্টেন্ট ও ব্যানার ব্যবস্থাপনা</h3>
                <p className="text-xs text-slate-500">
                  হোমপেজের হিরো ব্যানার, স্লোগান, লোগো ও যোগাযোগ তথ্য তাৎক্ষণিকভাবে পরিবর্তন করুন
                </p>
              </div>

              {/* 1. Branding */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-700" />
                  ১. ব্র্যান্ড ও লোগো (Branding)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">স্টোর নাম (English)</label>
                    <input
                      type="text"
                      value={contentFormData.storeName || ''}
                      onChange={(e) => setContentFormData({ ...contentFormData, storeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">বাংলা নাম (Bangla)</label>
                    <input
                      type="text"
                      value={contentFormData.banglaStoreName || ''}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, banglaStoreName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">লোগো ছবির URL</label>
                    <input
                      type="text"
                      value={contentFormData.logo || ''}
                      onChange={(e) => setContentFormData({ ...contentFormData, logo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">টপ অ্যানাউন্সমেন্ট বার লেখা</label>
                    <input
                      type="text"
                      value={contentFormData.announcementText || ''}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, announcementText: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Hero Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Globe size={14} className="text-emerald-700" />
                  ২. হিরো সেকশন ব্যানার ও হেডলাইন (Hero Banner)
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">হিরো হেডলাইন (Title) *</label>
                    <input
                      type="text"
                      value={contentFormData.heroHeadline || ''}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, heroHeadline: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">হিরো সাব-হেডলাইন (Subtitle)</label>
                    <textarea
                      rows={2}
                      value={contentFormData.heroSubheadline || ''}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, heroSubheadline: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8">
                      <label className="font-semibold text-slate-700 block mb-1">হিরো ব্যানার ছবির URL</label>
                      <input
                        type="text"
                        value={contentFormData.heroImage || ''}
                        onChange={(e) =>
                          setContentFormData({ ...contentFormData, heroImage: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-4 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1">
                      <img
                        src={contentFormData.heroImage || '/images/barakah/sorisa5liter.png'}
                        alt="Hero Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">বাটন ১ এর টেক্সট</label>
                      <input
                        type="text"
                        value={contentFormData.heroButtonText || 'পণ্য কিনুন'}
                        onChange={(e) =>
                          setContentFormData({ ...contentFormData, heroButtonText: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">বাটন ২ এর টেক্সট</label>
                      <input
                        type="text"
                        value={contentFormData.heroButton2Text || 'অফার সমূহ দেখুন'}
                        onChange={(e) =>
                          setContentFormData({ ...contentFormData, heroButton2Text: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Contact & Socials */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-700" />
                  ৩. যোগাযোগ, সোশ্যাল মিডিয়া ও ডেলিভারি রেট (Contact & Socials)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">হটলাইন ফোন নম্বর</label>
                    <input
                      type="text"
                      value={contentFormData.hotline || ''}
                      onChange={(e) => setContentFormData({ ...contentFormData, hotline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                    <input
                      type="text"
                      value={contentFormData.whatsappNumber || ''}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={contentFormData.email || ''}
                      onChange={(e) => setContentFormData({ ...contentFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ঢাকার ভেতরে ডেলিভারি ফি (৳)</label>
                    <input
                      type="number"
                      value={contentFormData.insideDhakaFee || 80}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, insideDhakaFee: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ঢাকার বাইরে ডেলিভারি ফি (৳)</label>
                    <input
                      type="number"
                      value={contentFormData.outsideDhakaFee || 130}
                      onChange={(e) =>
                        setContentFormData({ ...contentFormData, outsideDhakaFee: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ফ্রি ডেলিভারি ন্যূনতম কেনাকাটা (৳)</label>
                    <input
                      type="number"
                      value={contentFormData.freeShippingThreshold || 2500}
                      onChange={(e) =>
                        setContentFormData({
                          ...contentFormData,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1">অফিস ও স্টোর ঠিকানা</label>
                  <input
                    type="text"
                    value={contentFormData.address || ''}
                    onChange={(e) => setContentFormData({ ...contentFormData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  সেটিংস সংরক্ষণ করুন (Save Settings)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SECURITY & ADMIN PASSWORDS (/admin/security) */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">অ্যাডমিন পাসওয়ার্ড ও নিরাপত্তা</h3>
                <p className="text-xs text-slate-500">আপনার নিজস্ব গোপন পাসওয়ার্ড পরিবর্তন ও আপডেট করুন</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
              🔒 <strong>নিরাপত্তা নির্দেশিকা:</strong> এই পাসওয়ার্ডটি ডাটাবেজে এনক্রিপ্ট করে সংরক্ষণ করা হয় এবং সাধারণ গ্রাহকদের কাছে কখনো প্রদর্শিত হয় না।
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">বর্তমান পাসওয়ার্ড (Current Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড দিন..."
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">নতুন পাসওয়ার্ড (New Password)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন শক্তিশালী পাসওয়ার্ড..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় লিখুন..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Product Delete Confirmation Modal */}
      <ProductDeleteModal
        isOpen={Boolean(deleteModalProduct)}
        product={deleteModalProduct}
        onClose={() => setDeleteModalProduct(null)}
        onConfirmArchive={handleArchiveProduct}
        onConfirmPermanentDelete={handlePermanentDeleteProduct}
      />

      {/* Order Edit / Invoice Modal */}
      <OrderEditModal
        isOpen={isOrderModalOpen}
        order={selectedOrder}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveOrder}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
};
