# MapBuddi Project Status

**Last Updated:** October 5, 2025  
**Current Version:** Production v2.0  
**Environment:** Staging + Production deployed

---

## 🚀 **Current State Overview**

MapBuddi is a **multi-vendor digital marketplace** built with Next.js, featuring Stripe Connect payments, Supabase PostgreSQL database, and comprehensive seller analytics. The platform is fully functional for digital product sales with a 10% platform fee structure.

---

## 🛠️ **Technical Stack**

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** Tailwind CSS + Radix UI components
- **Authentication:** Clerk (latest clerkMiddleware)
- **File Uploads:** UploadThing
- **Icons:** Lucide React

### **Backend**
- **Database:** Supabase PostgreSQL (migrated from MySQL)
- **ORM:** Drizzle ORM v0.44.5
- **Payments:** Stripe Connect (Express accounts)
- **API Version:** Stripe 2025-08-27.basil
- **Webhooks:** Configured for both main and Connect accounts

### **Deployment**
- **Hosting:** Vercel
- **Branches:** `staging` (development) → `main` (production)
- **Environment Variables:** Configured for all environments

---

## 📊 **Database Schema**

### **Core Tables**
```sql
-- Products (Digital only - no inventory)
products: id, name, price, description, images, storeId

-- Orders (with Stripe integration)
orders: id, prettyOrderId, storeId, items, total, stripePaymentIntentId, 
        stripePaymentIntentStatus, name, email, createdAt, addressId

-- Carts (User-associated)
carts: id, items, paymentIntentId, clientSecret, isClosed, userId

-- Payments (Stripe Connect accounts)
payments: id, storeId, stripeAccountId

-- Stores (Seller accounts)
stores: id, name, slug, description, userId

-- Addresses (Order shipping)
addresses: id, line1, line2, city, state, postal_code, country
```

---

## 💳 **Payment System**

### **Stripe Configuration**
- **Main Account:** Platform account (receives 10% fees)
- **Connect Accounts:** Express accounts for sellers
- **Webhook Endpoints:**
  - `https://mapbuddi.com/api/webhooks/stripe` (main account)
  - `https://mapbuddi.com/api/webhooks/stripe/connect` (Connect accounts)

### **Fee Structure**
- **Platform Fee:** 10% of all sales (collected via `application_fee_amount`)
- **Calculation:** Applied to PaymentIntents during creation/update
- **Constant:** `platformFeeDecimal = 0.10` in `lib/application-constants.tsx`

---

## 🔐 **Authentication & Authorization**

### **Clerk Setup**
- **Middleware:** `clerkMiddleware()` (latest version)
- **Public Routes:** Webhooks, storefront pages
- **Protected Routes:** All `/account/*` pages
- **User Association:** Carts and stores linked to Clerk user IDs

---

## 📈 **Seller Analytics Dashboard**

### **Orders Page** (`/account/selling/orders`)
**Summary Cards:**
- Total Sales Value (lifetime)
- Net Earnings (after 10% platform fee)
- Total Orders count
- Average Order Value
- Last 30 Days Sales & Orders
- Platform Fees Paid

**Analytics Sections:**
- Product Performance (top 5 by revenue)
- Monthly Sales Breakdown (last 6 months)
- Recent Orders List (last 10)

### **Payments Page** (`/account/selling/payments`)
- Available Balance (ready for payout)
- Pending Balance (processing)
- Recent Payouts (last 5 with status)
- Stripe Account Details

---

## 🛒 **E-commerce Features**

### **Digital Products**
- ✅ No inventory tracking (removed completely)
- ✅ Unlimited availability
- ✅ Image uploads via UploadThing
- ✅ Multi-vendor support

### **Shopping Cart**
- ✅ User-associated carts
- ✅ Session persistence
- ✅ Multi-vendor checkout support
- ✅ Stripe PaymentIntent integration

### **Order Management**
- ✅ Webhook-driven order creation
- ✅ Email notifications
- ✅ Order history for buyers and sellers
- ✅ Pretty order IDs (sequential per store)

---

## 🌐 **Deployment & Environments**

### **Environment Variables Required**
```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=...

# App URL
NEXT_PUBLIC_APP_URL=https://mapbuddi.com
```

### **Vercel Configuration**
- **Production:** `main` branch → `https://mapbuddi.com`
- **Staging:** `staging` branch → `https://staging.mapbuddi.com`
- **Protection:** Disabled for webhook endpoints
- **Build Command:** `pnpm run build`

---

## 🔧 **Key File Locations**

### **Core Configuration**
- `db/schema.ts` - Database schema definitions
- `db/db.ts` - Database connection (Supabase)
- `drizzle.config.ts` - ORM configuration
- `middleware.ts` - Clerk authentication middleware

### **Payment Logic**
- `server-actions/stripe/payment.ts` - PaymentIntent creation/updates
- `server-actions/stripe/account.ts` - Stripe Connect management
- `app/api/webhooks/stripe/route.ts` - Main webhook handler
- `app/api/webhooks/stripe/connect/route.ts` - Connect webhook handler

### **UI Components**
- `components/admin/` - Seller dashboard components
- `components/storefront/` - Buyer-facing components
- `components/ui/` - Reusable UI components (Radix-based)

### **Analytics**
- `app/account/selling/(orders)/orders/page.tsx` - Seller analytics dashboard
- `app/account/selling/payments/page.tsx` - Payout management

---

## 🐛 **Known Issues & Solutions**

### **Resolved Issues**
- ✅ **Cart Persistence:** Fixed user association
- ✅ **Webhook Delivery:** Both main and Connect webhooks working
- ✅ **PaymentIntent Reuse:** Proper status checking implemented
- ✅ **Inventory Removal:** All references cleaned up
- ✅ **Platform Fees:** 10% fee collection working

### **Test Data**
- **Staging Balance Discrepancy:** $1,361.06 pending includes $590 in test payments from development (intentionally left as-is)
- **Debug Tool:** `/debug/stripe-orders` available for troubleshooting

---

## 📋 **Recent Major Changes**

### **Database Migration** (Sept 29, 2025)
- Migrated from MySQL to Supabase PostgreSQL
- Updated all Drizzle ORM configurations
- Fixed connection pooling issues

### **Stripe Updates** (Sept 29, 2025)
- Updated to latest Stripe API version (2025-08-27.basil)
- Switched to Express Connect accounts
- Implemented proper webhook handling

### **Digital Products** (Oct 5, 2025)
- Removed all inventory-related functionality
- Updated UI components and database schema
- Simplified product management

### **Analytics Dashboard** (Oct 5, 2025)
- Added comprehensive seller analytics
- Implemented payout tracking
- Created performance metrics

---

## 🎯 **Current Capabilities**

### **For Sellers**
- ✅ Create and manage digital products
- ✅ Connect Stripe Express accounts
- ✅ View comprehensive sales analytics
- ✅ Track earnings and payouts
- ✅ Manage orders and customers

### **For Buyers**
- ✅ Browse multi-vendor marketplace
- ✅ Add products to cart from multiple sellers
- ✅ Secure checkout with Stripe
- ✅ View purchase history
- ✅ Receive email confirmations

### **For Platform (MapBuddi)**
- ✅ Collect 10% fees automatically
- ✅ Support unlimited sellers
- ✅ Process payments via Stripe Connect
- ✅ Handle webhooks reliably

---

## 🔮 **Architecture Notes**

### **Multi-Vendor Checkout**
- Each store has separate checkout flows (`/checkout/[storeSlug]`)
- PaymentIntents created per store's Stripe Connect account
- Platform fees applied via `application_fee_amount`

### **User Flow**
1. **Seller:** Sign up → Create store → Connect Stripe → Add products
2. **Buyer:** Browse → Add to cart → Checkout → Receive products
3. **Platform:** Collect fees → Process payouts → Provide analytics

### **Data Flow**
1. **Payment:** Stripe PaymentIntent created with platform fee
2. **Webhook:** Order created in database upon payment success
3. **Cart:** Closed and cleared after successful payment
4. **Analytics:** Real-time calculations from order data

---

## 📞 **For Future Development**

### **Quick Reference Commands**
```bash
# Switch to staging for development
git checkout staging

# Deploy to production
git checkout main && git merge staging && git push origin main

# Database migrations
npx drizzle-kit generate && npx drizzle-kit push

# Debug payments
# Visit: /debug/stripe-orders
```

### **Common Tasks**
- **Add new features:** Work in `staging` branch
- **Update environment variables:** Vercel dashboard
- **Check webhooks:** Stripe dashboard → Webhooks
- **Database queries:** Use Supabase dashboard or MCP tools
- **Debug payments:** Use `/debug/stripe-orders` page

---

## 🗺️ **Location Lists Feature - Implementation Plan**

### **Product Vision**
Transform MapBuddi from a general digital marketplace to a location-based curated list platform where sellers create POI collections that buyers can sync directly into their Google Maps.

### **Core Concept**
- **Sellers** create curated location lists (e.g., "Best of Lisbon") with categorized POIs
- **Buyers** purchase lists and sync them to their personal Google Maps via My Maps
- **Categories** within lists have emoji identifiers and custom POI notes from sellers

### **Technical Implementation Strategy**

#### **Database Schema Extensions**
```sql
-- Location Lists (replaces general products)
location_lists: id, name, description, price, coverImage, storeId, 
                isActive, totalPois, avgRating, createdAt

-- Categories within lists  
list_categories: id, listId, name, emoji, iconColor, displayOrder

-- Points of Interest
list_pois: id, categoryId, name, description, sellerNotes, 
           latitude, longitude, googlePlaceId, address, displayOrder

-- Purchased Lists
purchased_lists: id, userId, listId, purchaseDate, lastSyncDate, 
                 syncStatus, hasCustomModifications

-- List Reviews (future)
list_reviews: id, listId, userId, rating, review, createdAt
```

#### **Google Maps Integration**
- **Method**: KML file generation for Google My Maps import
- **Authentication**: Google OAuth 2.0 for Drive/Maps access
- **API Usage**: Google Places API for POI search and validation
- **Cost Management**: ~$0.50/month per active seller in API costs

#### **Seller Workflow**
1. **Create List**: Name, description, cover image, price
2. **Add Categories**: Name + emoji (🍽️ Restaurants, 🎭 Attractions, etc.)
3. **Add POIs**: 
   - Search Google Places API for existing locations
   - Manual entry for custom spots (sunset viewpoints, hidden gems)
   - Add seller notes and assign to categories
4. **Preview & Publish**: Test KML generation, set pricing

#### **Buyer Workflow**
1. **Browse Lists**: See preview with category counts and sample map
2. **Purchase**: Standard Stripe checkout flow
3. **Google Auth**: One-time authentication for Maps access
4. **Sync to Maps**: 
   - Generate KML file with custom styling per category
   - Auto-import to Google My Maps or provide download link
   - Toggle sync on/off for purchased lists

#### **MVP Feature Set**
- ✅ List creation and management for sellers
- ✅ POI search via Google Places API
- ✅ Manual POI entry with coordinates
- ✅ Category organization with emoji identifiers
- ✅ List purchasing and order management
- ✅ KML generation and Google Maps sync
- ✅ Basic list previews for browsers

#### **Phase 2 Features** (Post-MVP)
- List reviews and ratings
- Seller profile pages with all their lists
- List update notifications and re-sync options
- Buyer modifications to purchased lists
- Advanced search and filtering
- Apple Maps integration
- Social sharing and list discovery

### **Business Model Update**
- **Sellers**: $30/month subscription + 10% of sales
- **Buyers**: Individual list purchases ($5-50 typical range)
- **Platform Costs**: Google API usage (~$0.50/seller/month)
- **Revenue**: Subscription fees + sales commissions - API costs

### **Development Priority**
1. **Database Migration**: Add location lists schema
2. **Google Integration**: Places API + OAuth setup  
3. **Seller Interface**: List creation and POI management
4. **KML Generation**: Export functionality for My Maps
5. **Buyer Interface**: Browse, purchase, sync workflow
6. **Testing**: End-to-end workflow validation

### **Success Metrics**
- Lists created per seller per month
- Average POIs per list (target: 15-30)
- Purchase conversion rate from preview views
- Successful sync rate to Google Maps
- Seller retention on subscription model

---

**This document should be updated whenever major changes are made to the platform.**
