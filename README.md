# Barakah Agro (বারাকাহ এগ্রো) - Pure Food & Organic E-Commerce Platform

A production-grade, full-stack Bangladeshi organic e-commerce web platform and content management system for **Barakah Agro**. The application features an authentic customer storefront (wood-pressed mustard oil, Sundarban natural honey, homemade cow ghee, moringa/sajna leaf powder, premium dates, and natural groceries) combined with a database-backed **Admin Panel** (`/admin`) for real-time inventory, category, order, customer, and homepage content management.

---

## Table of Contents

1. [Features & Architecture](#features--architecture)
2. [Project Structure](#project-structure)
3. [Prerequisites & Required Software](#prerequisites--required-software)
4. [Step-by-Step Installation](#step-by-step-installation)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Database Setup (Firebase Firestore)](#database-setup-firebase-firestore)
7. [Admin Panel & Authentication Setup](#admin-panel--authentication-setup)
8. [Running Locally in VS Code](#running-locally-in-vs-code)
9. [Building for Production](#building-for-production)
10. [Deployment Guide (Vercel, Render, Firebase Hosting, Cloud Run)](#deployment-guide)
11. [Creating and Managing Admin Accounts](#creating-and-managing-admin-accounts)
12. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 1. Features & Architecture

- **Storefront**:
  - High-converting hero banner with direct Call-to-Actions and video badges.
  - Interactive categories filter with real product counts.
  - Flash deal countdown timer and special bundle discounts.
  - Product modal with package/weight selection (e.g. 500ml, 1 Liter, 5 Liter).
  - One-click **"Buy Now" (অর্ডার করুন)** direct checkout flow and slide-out Cart Drawer.
  - Seamless checkout supporting Cash on Delivery (COD), bKash, and Nagad.
  - Live customer order tracking (`/track`) by Order ID and Mobile Number.
  - Verified customer product reviews and star ratings.
  - Dynamic delivery fee calculation (Inside Dhaka vs. Outside Dhaka) with free delivery threshold.

- **Admin Management System (`/admin`)**:
  - **Overview Dashboard**: Live statistics for total sales (৳), total orders, pending orders, products, and customers.
  - **Product Management (`/admin/products`)**: Add, edit, duplicate, activate/deactivate, and delete/archive products with immediate storefront sync.
  - **Category Management (`/admin/categories`)**: Create and manage categories, banner images, and display sorting.
  - **Order Management (`/admin/orders`)**: Filter orders by status (Pending, Confirmed, Processing, Packed, Shipped, Out for Delivery, Delivered, Cancelled). Open order invoice modal to adjust quantities, shipping, discounts, and customer notes.
  - **Customer Directory (`/admin/customers`)**: View customer order counts, spending, and toggle account activation.
  - **Website Content Management (`/admin/content`)**: Customize the homepage headlines, hero banner image, logo, hotline, WhatsApp number, and address without touching code.
  - **Security Settings (`/admin/security`)**: Change admin password with database synchronization.

- **Dual-Mode Data Architecture**:
  - Primary: **Firebase Firestore** real-time snapshot listeners (`subscribeToProducts`, `subscribeToCategories`, etc.).
  - Secondary / Local Fallback: Integrated Express backend API (`/api/*`) with auto-seeding sample datasets.

---

## 2. Project Structure

```
├── .env.example                # Template for required environment variables
├── .gitignore                  # Git ignore rules (node_modules, dist, .env)
├── firebase-applet-config.json # Firebase connection credentials
├── firebase-blueprint.json     # Firestore schemas & intermediate representation
├── firestore.rules             # Production security rules for Firestore
├── index.html                  # HTML entry point with metadata and fonts
├── metadata.json               # App manifest and permissions
├── package.json                # Project dependencies and npm scripts
├── public/                     # Static public assets (images, logos, banners)
│   └── images/
│       └── barakah/            # Authentic Barakah Agro product images
├── server/                     # Backend API handlers and local fallback db
│   ├── api.ts                  # Express REST routes (/api/products, /api/orders...)
│   └── db.ts                   # Local JSON data store fallback
├── server.ts                   # Full-stack Node.js server entry point
├── src/
│   ├── App.tsx                 # Root router and real-time subscription controller
│   ├── firebase.ts             # Firebase app, Firestore db, and auth initialization
│   ├── main.tsx                # React DOM root mounting
│   ├── components/
│   │   ├── AboutPage.tsx       # About Barakah Agro story & mission
│   │   ├── AdminDashboard.tsx  # Core admin management suite (/admin)
│   │   ├── AdminLoginPage.tsx  # Secure admin login form (/admin/login)
│   │   ├── AuthModal.tsx       # Customer phone/email sign-in modal
│   │   ├── CartDrawer.tsx      # Slide-out shopping bag
│   │   ├── CheckoutPage.tsx    # Cash on delivery / mobile banking checkout
│   │   ├── ContactPage.tsx     # Contact info, Google map, and feedback
│   │   ├── Footer.tsx          # Store footer, links, and guarantee badges
│   │   ├── HomePage.tsx        # Storefront homepage sections
│   │   ├── Navbar.tsx          # Sticky navigation bar with search & cart counter
│   │   ├── OrderTrackingPage.tsx # Live delivery tracker (/track)
│   │   ├── ProductCard.tsx     # Storefront product card with badges & quick-add
│   │   ├── ProductDetailModal.tsx # Product details, ingredients & customer reviews
│   │   ├── ShopPage.tsx        # Filterable & searchable product catalog (/shop)
│   │   ├── WishlistPage.tsx    # Customer saved items
│   │   └── admin/
│   │       ├── CategoryModal.tsx       # Add / Edit category modal
│   │       ├── OrderEditModal.tsx      # Order status & invoice editor
│   │       ├── ProductDeleteModal.tsx  # Soft-archive / permanent delete confirmation
│   │       └── ProductFormModal.tsx    # Comprehensive product create/edit form
│   ├── context/
│   │   ├── AuthContext.tsx     # Admin & customer authentication state
│   │   ├── CartContext.tsx     # Persistent shopping cart & coupon state
│   │   └── WishlistContext.tsx # Saved wishlist items state
│   ├── services/
│   │   ├── api.ts              # Unified API client bridging UI to database
│   │   └── firestoreService.ts # Real-time Firestore queries, CRUD & listeners
│   └── types/
│       └── ecommerce.ts        # TypeScript data models and interfaces
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite bundler configuration with Tailwind CSS
```

---

## 3. Prerequisites & Required Software

Make sure the following software is installed on your computer:

1. **Node.js**: Version `18.x`, `20.x`, or higher. (Recommended: Node `20.x LTS` from [nodejs.org](https://nodejs.org/)).
2. **npm** (comes with Node.js) or **yarn** / **pnpm** / **bun**.
3. **Git**: Installed from [git-scm.com](https://git-scm.com/).
4. **Visual Studio Code (VS Code)**: From [code.visualstudio.com](https://code.visualstudio.com/).

---

## 4. Step-by-Step Installation

1. Open your terminal (or VS Code terminal) in your desired project directory:
   ```bash
   cd path/to/your/projects
   ```

2. Extract or clone the project repository:
   ```bash
   # If you downloaded a zip archive:
   unzip barakah-agro.zip
   cd barakah-agro
   ```

3. Install all project dependencies:
   ```bash
   npm install
   ```

---

## 5. Environment Variables Configuration

1. Create your local `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in VS Code and verify the variables:
   ```env
   # Server port
   PORT=3000
   NODE_ENV=development

   # Firebase Client configuration (optional if using firebase-applet-config.json)
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_DATABASE_ID="(default)"

   # Master admin password override (optional)
   ADMIN_SECRET_PIN="barakah2026"
   ```

> **Note**: The project is already configured with `firebase-applet-config.json`. If that file is present, the app will run immediately without manual Firebase setup!

---

## 6. Database Setup (Firebase Firestore)

The application uses **Firebase Firestore** for persistent real-time storage across storefront and admin panel.

### Required Firestore Collections

| Collection Name | Purpose | Key Fields |
|---|---|---|
| `products` | Product catalog | `id`, `name`, `banglaName`, `price`, `oldPrice`, `stock`, `category`, `image`, `isActive`, `isArchived` |
| `categories` | Product categories | `id`, `name`, `banglaName`, `slug`, `image`, `isActive`, `displayOrder` |
| `orders` | Customer orders | `id`, `customerName`, `phone`, `address`, `items`, `total`, `status`, `paymentStatus` |
| `customers` | Customer directory | `id`, `name`, `phone`, `email`, `ordersCount`, `totalSpent`, `isActive` |
| `siteSettings` | Website content | `storeName`, `heroHeadline`, `heroSubheadline`, `heroImage`, `hotline`, `insideDhakaFee` |
| `reviews` | Customer reviews | `id`, `author`, `city`, `rating`, `comment`, `productName`, `verified` |
| `coupons` | Promo discounts | `id`, `code`, `discountType`, `discountValue`, `minSpend`, `isActive` |
| `admins` | Authorized administrators | `id`, `email`, `passwordHash`, `role`, `isActive` |

### Automatic Seeding

When the application boots for the first time, `ensureDatabaseSeeded()` runs automatically. If any collection is empty, it automatically populates authentic Barakah Agro products (Wood-pressed Mustard Oil, Sundarban Honey, Ghee, Sajna Leaf Powder), categories, site settings, and admin accounts into your database.

### Firestore Security Rules

The security rules are defined in `firestore.rules`. To deploy them using the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore # select your project
firebase deploy --only firestore:rules
```

---

## 7. Admin Panel & Authentication Setup

- **Admin Login URL**: `http://localhost:3000/admin/login`
- **Default Authorized Admin Emails**:
  - `tahminajannatayesha@gmail.com`
  - `admin@barakahagro.com`
- **Default Master Password**:
  - `barakah2026`

### How Authentication Works

1. Regular customers navigating to `/admin` are denied access and redirected to `/admin/login`.
2. Logging in with authorized admin credentials creates an active admin session.
3. You can change your password anytime inside **Admin Panel -> নিরাপত্তা ও পাসওয়ার্ড (Security)** tab.
4. Passwords and credentials are kept secure and are never rendered on the public storefront.

---

## 8. Running Locally in VS Code

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   - **Customer Storefront**: [http://localhost:3000](http://localhost:3000)
   - **Admin Management Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - **Product Catalog**: [http://localhost:3000/shop](http://localhost:3000/shop)
   - **Order Tracking**: [http://localhost:3000/track](http://localhost:3000/track)

3. In VS Code, open another terminal tab if you wish to run linter checks:
   ```bash
   npm run lint
   ```

---

## 9. Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles your TypeScript files, optimizes CSS with Tailwind, and outputs the production bundle to the `dist/` directory.

To test the production build locally:
```bash
NODE_ENV=production npm run start
```

---

## 10. Deployment Guide

### Option A: Deploy to Vercel (Recommended for Frontend SPA)

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Add your environment variables (`VITE_FIREBASE_...`) in the Vercel dashboard.
6. Click **Deploy**.

### Option B: Deploy Full-Stack to Render / Railway / Cloud Run

1. Build Command: `npm install && npm run build`
2. Start Command: `npm run start`
3. Port: `3000` (or `PORT` environment variable).

### Option C: Deploy to Firebase Hosting

```bash
firebase init hosting
# Set public directory to 'dist'
# Configure as a single-page app: Yes
npm run build
firebase deploy --only hosting
```

---

## 11. Creating and Managing Admin Accounts

To add a new admin user directly in Firebase:
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Go to **Firestore Database** -> `admins` collection.
3. Click **Add document**:
   - `email`: `your-email@example.com`
   - `name`: `Your Name`
   - `role`: `admin`
   - `isActive`: `true`
   - `passwordHash`: `your-chosen-password`
   - `createdAt`: ISO date string

---

## 12. Troubleshooting & FAQs

- **Q: My products are not appearing on the website.**
  - **A:** Check your internet connection to Firestore. The app will automatically fall back to bundled catalog items if offline.
- **Q: I cannot log into `/admin/login`.**
  - **A:** Use `tahminajannatayesha@gmail.com` with password `barakah2026`.
- **Q: Port 3000 is already in use.**
  - **A:** Start with a different port: `PORT=3001 npm run dev`.
- **Q: Can I run this without any Firebase account?**
  - **A:** Yes! The project includes an Express backend server with a local JSON database in `server-data/db.json`. If Firebase is unreachable, the store automatically falls back to local data gracefully.
