import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './components/HomePage';
import { ShopPage } from './components/ShopPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { AdminDashboard, AdminTab } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AuthModal } from './components/AuthModal';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { WishlistPage } from './components/WishlistPage';
import { Footer } from './components/Footer';

import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToSettings,
  subscribeToReviews,
  ensureDatabaseSeeded,
} from './services/firestoreService';

import type {
  Product,
  Category,
  SiteSettings,
  SiteReview,
  ProductVariant,
  Order,
} from './types/ecommerce';

function MainStore() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [defaultAdminAuth, setDefaultAdminAuth] = useState(false);

  // App Data connected directly to Firestore Real-Time Subscriptions
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Routing state
  const [adminPathTab, setAdminPathTab] = useState<AdminTab>('overview');

  const { addToCart, setIsDrawerOpen } = useCart();
  const { isAdmin } = useAuth();

  // Helper to parse path into view & admin tab
  const handleLocationChange = () => {
    const path = window.location.pathname;

    if (path.startsWith('/admin')) {
      if (path === '/admin/login') {
        setCurrentView('admin-login');
      } else {
        setCurrentView('admin');
        if (path === '/admin/products' || path === '/admin/products/new') {
          setAdminPathTab('products');
        } else if (path === '/admin/categories') {
          setAdminPathTab('categories');
        } else if (path === '/admin/orders') {
          setAdminPathTab('orders');
        } else if (path === '/admin/customers') {
          setAdminPathTab('customers');
        } else if (path === '/admin/content') {
          setAdminPathTab('content');
        } else if (path === '/admin/security') {
          setAdminPathTab('security');
        } else {
          setAdminPathTab('overview');
        }
      }
    } else if (path === '/shop') {
      setCurrentView('shop');
    } else if (path === '/checkout') {
      setCurrentView('checkout');
    } else if (path === '/track') {
      setCurrentView('track');
    } else if (path === '/about') {
      setCurrentView('about');
    } else if (path === '/contact') {
      setCurrentView('contact');
    } else if (path === '/wishlist') {
      setCurrentView('wishlist');
    }
  };

  useEffect(() => {
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Real-time Firestore Subscriptions for Storefront
  useEffect(() => {
    setLoading(true);

    // Ensure database seeds on launch
    ensureDatabaseSeeded().catch((err) => console.warn('Database seed check:', err));

    // 1. Live Products Subscription (only active non-archived for public store)
    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setLoading(false);
    }, false);

    // 2. Live Categories Subscription
    const unsubCategories = subscribeToCategories((cats) => {
      setCategories(cats);
    }, false);

    // 3. Live Settings Subscription
    const unsubSettings = subscribeToSettings((sett) => {
      setSettings(sett);
    });

    // 4. Live Reviews Subscription
    const unsubReviews = subscribeToReviews((revs) => {
      setReviews(revs);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
      unsubReviews();
    };
  }, []);

  // Handler for direct checkout / "Buy Now"
  const handleInstantBuy = (product: Product, variant: ProductVariant, quantity: number) => {
    addToCart({
      productId: product.id,
      name: product.name,
      banglaName: product.banglaName,
      image: product.image,
      packageLabel: variant.label,
      price: variant.price,
      quantity,
      stock: variant.stock || product.stock,
    });
    setSelectedProduct(null);
    setCurrentView('checkout');
    window.history.pushState(null, '', '/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentView('shop');
    window.history.pushState(null, '', '/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    let path = '/';
    if (view === 'shop') path = '/shop';
    else if (view === 'checkout') path = '/checkout';
    else if (view === 'track') path = '/track';
    else if (view === 'about') path = '/about';
    else if (view === 'contact') path = '/contact';
    else if (view === 'wishlist') path = '/wishlist';
    else if (view === 'admin') path = '/admin';
    else if (view === 'admin-login') path = '/admin/login';

    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // ROUTING VIEW RENDERERS
  // -------------------------------------------------------------

  // View: /admin/login
  if (currentView === 'admin-login') {
    if (isAdmin) {
      // If already logged in, redirect directly to admin dashboard
      return (
        <AdminDashboard
          initialTab={adminPathTab}
          onLogout={() => handleNavigate('home')}
          onViewStore={() => handleNavigate('home')}
        />
      );
    }
    return (
      <AdminLoginPage
        onSuccess={() => {
          setCurrentView('admin');
          window.history.pushState(null, '', '/admin');
        }}
        onBackToStore={() => handleNavigate('home')}
      />
    );
  }

  // View: /admin and all /admin/* paths
  if (currentView === 'admin') {
    if (!isAdmin) {
      // Unauthorized customer / guest tries to open admin -> access denied, show login!
      return (
        <AdminLoginPage
          onSuccess={() => {
            setCurrentView('admin');
            window.history.pushState(null, '', '/admin');
          }}
          onBackToStore={() => handleNavigate('home')}
        />
      );
    }

    // Authorized Admin -> show Dashboard
    return (
      <AdminDashboard
        initialTab={adminPathTab}
        onLogout={() => handleNavigate('home')}
        onViewStore={() => handleNavigate('home')}
        onNavigateTab={(tab, path) => setAdminPathTab(tab)}
      />
    );
  }

  // Public Storefront
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1E293B]">
      {/* 1. Header & Navigation */}
      <Navbar
        products={products}
        categories={categories}
        settings={settings}
        activeView={currentView}
        setActiveView={handleNavigate}
        onSelectProduct={(p: Product) => setSelectedProduct(p)}
        onSelectCategory={handleSelectCategory}
        onOpenAuth={() => {
          setDefaultAdminAuth(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* 2. Main Page Views */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className="w-10 h-10 border-4 border-[#14532d] border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-bold text-slate-500">বারাকাহ এগ্রো লোড হচ্ছে...</div>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                products={products}
                categories={categories}
                settings={settings}
                reviews={reviews}
                onNavigate={handleNavigate}
                onSelectCategory={handleSelectCategory}
                onOpenProductDetails={(p) => setSelectedProduct(p)}
                onInstantBuy={handleInstantBuy}
              />
            )}

            {(currentView === 'shop' ||
              currentView === 'offers' ||
              currentView === 'new-arrivals' ||
              currentView === 'best-sellers') && (
              <ShopPage
                products={products}
                categories={categories}
                selectedCategorySlug={selectedCategorySlug}
                onSelectCategory={setSelectedCategorySlug}
                onOpenProductDetails={(p) => setSelectedProduct(p)}
                onInstantBuy={handleInstantBuy}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage
                onBackToShopping={() => handleNavigate('shop')}
                onOrderCompleted={(order: Order) => {
                  console.log('Order completed:', order.id);
                }}
              />
            )}

            {currentView === 'track' && <OrderTrackingPage />}

            {currentView === 'wishlist' && (
              <WishlistPage
                products={products}
                onOpenProductDetails={(p) => setSelectedProduct(p)}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'about' && <AboutPage settings={settings} />}

            {currentView === 'contact' && <ContactPage settings={settings} />}
          </>
        )}
      </main>

      {/* 3. Footer */}
      <Footer
        categories={categories}
        settings={settings}
        onSelectCategory={handleSelectCategory}
        onNavigate={handleNavigate}
      />

      {/* 4. Cart Drawer */}
      <CartDrawer
        onCheckout={() => {
          setIsDrawerOpen(false);
          handleNavigate('checkout');
        }}
        onContinueShopping={() => setIsDrawerOpen(false)}
      />

      {/* 5. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onInstantBuy={handleInstantBuy}
        onSelectRelated={(p) => setSelectedProduct(p)}
        allProducts={products}
        reviews={reviews}
        onReviewSubmitted={(newRev) => setReviews([newRev, ...reviews])}
      />

      {/* 6. Auth Modal (Customer Login & Admin Access) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultAdmin={defaultAdminAuth}
        onAdminSuccess={() => {
          setIsAuthModalOpen(false);
          handleNavigate('admin');
        }}
      />

      {/* Floating Admin Entry Button */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => {
            if (isAdmin) {
              handleNavigate('admin');
            } else {
              handleNavigate('admin-login');
            }
          }}
          className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] font-bold shadow-lg backdrop-blur-xs flex items-center gap-1.5 transition-all opacity-85 hover:opacity-100 cursor-pointer"
          title="অ্যাডমিন প্যানেল"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>অ্যাডমিন প্যানেল</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <MainStore />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
