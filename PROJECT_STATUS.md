# MapBuddi Project Status

**Last Updated:** December 29, 2025  
**Current Version:** Location Lists v1.0  
**Environment:** Staging + Production deployed

---

## 🚀 **Current State Overview**

MapBuddi has been **successfully transformed** into a **location-based digital marketplace** where sellers create curated POI lists that buyers can purchase and sync to their Google Maps. The platform now specializes in location lists instead of general digital products, with a simplified USD-only backend and multi-currency display for buyers.

---

## 🛠️ **Technical Stack**

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** Tailwind CSS + Radix UI components
- **Authentication:** Clerk (latest clerkMiddleware)
- **File Uploads:** UploadThing
- **Icons:** Lucide React
- **Currency:** Multi-currency display with real-time conversion

### **Backend**
- **Database:** Supabase PostgreSQL (migrated from MySQL)
- **ORM:** Drizzle ORM v0.44.5
- **Payments:** Stripe Connect (Express accounts) - USD only
- **API Version:** Stripe 2025-08-27.basil
- **Webhooks:** Configured for both main and Connect accounts
- **Google APIs:** Places API for POI search and validation

### **Deployment**
- **Hosting:** Vercel
- **Branches:** `staging` (development) → `main` (production)
- **Environment Variables:** Configured for all environments

---

## 📊 **Database Schema - Location Lists System**

### **Core Tables (Updated)**
```sql
-- Location Lists (replaces products)
location_lists: id, name, description, price, currency, coverImage, 
                storeId, isActive, totalPois, avgRating, createdAt, updatedAt

-- Categories within lists  
list_categories: id, listId, name, emoji, iconColor, displayOrder, createdAt

-- Points of Interest
list_pois: id, categoryId, name, description, sellerNotes, 
           latitude, longitude, googlePlaceId, address, displayOrder, createdAt

-- Purchased Lists (buyer orders)
purchased_lists: id, userId, listId, orderId, purchaseDate, lastSyncDate, 
                 syncStatus, hasCustomModifications, googleMyMapId

-- List Reviews
list_reviews: id, listId, userId, rating, review, createdAt

-- User Preferences (currency selection)
user_preferences: id, userId, preferredCurrency, createdAt, updatedAt

-- Stores (updated with currency support)
stores: id, name, slug, description, userId, currency

-- Orders (unchanged - handles location list purchases)
orders: id, prettyOrderId, storeId, items, total, stripePaymentIntentId, 
        stripePaymentIntentStatus, name, email, createdAt, addressId

-- Carts (unchanged)
carts: id, items, paymentIntentId, clientSecret, isClosed, userId
```

---

## 💳 **Payment System - Simplified USD**

### **Currency Architecture**
- **Backend Storage:** All prices stored in USD only
- **Stripe Processing:** All payments in USD (prevents conversion issues)
- **Frontend Display:** 24+ currencies with real-time conversion
- **User Experience:** Currency selector in top navigation

### **Stripe Configuration**
- **Main Account:** Platform account (receives 10% fees)
- **Connect Accounts:** Express accounts for sellers
- **Currency:** USD only for all transactions
- **Fee Structure:** 10% of all sales (collected via `application_fee_amount`)

### **Exchange Rates (Current)**
```javascript
USD: 1.00, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.514, 
CAD: 1.37, CHF: 0.88, CNY: 7.24, SEK: 10.85, NOK: 10.95
// + 14 more currencies with real market rates
```

---

## 🗺️ **Location Lists Feature - IMPLEMENTED**

### **✅ Completed Features**

#### **Seller Interface**
- **List Creation:** Name, description, price (USD), cover image
- **Category Management:** Custom categories with emoji identifiers
- **POI Management:** Add locations via Google Places API or manual entry
- **List Editor:** Comprehensive form with tabs for details, categories, POIs
- **List Status:** Draft/Live toggle for publishing

#### **Google Places Integration**
- **Search API:** Find existing POIs by name/location
- **Place Details:** Fetch coordinates, address, place ID
- **Manual Entry:** Custom locations with coordinates
- **Validation:** Ensure POI data integrity

#### **Buyer Experience**
- **Browse Lists:** Dedicated `/lists` page with filtering
- **List Details:** Individual list pages with POI previews
- **Purchase Flow:** Simplified checkout (no quantities)
- **Cart System:** Single-purchase model (qty always 1)
- **Currency Display:** Prices shown in user's preferred currency

#### **Database & Backend**
- **Schema Migration:** All location lists tables created
- **API Routes:** CRUD operations for lists, categories, POIs
- **Data Validation:** Proper handling of coordinates, images
- **Error Handling:** Fixed database type mismatches

#### **UI/UX Improvements**
- **No Quantity System:** Location lists purchased once only
- **Currency Selector:** Visible dropdown in top navigation
- **Simplified Cart:** Cover | List Name | Price | Remove
- **Clean Navigation:** "Location Lists" instead of "Products"
- **Responsive Design:** Works on mobile and desktop

---

## 🛒 **E-commerce Features - Updated**

### **Location Lists (Digital Products)**
- ✅ No inventory tracking (one-time digital purchases)
- ✅ Unlimited availability per list
- ✅ Cover image uploads via UploadThing
- ✅ Multi-vendor support
- ✅ Category-based organization
- ✅ POI management with coordinates

### **Shopping Cart - Simplified**
- ✅ User-associated carts
- ✅ Session persistence
- ✅ Multi-vendor checkout support
- ✅ No quantity selectors (always qty: 1)
- ✅ Remove-only cart editing
- ✅ Currency-aware totals

### **Order Management**
- ✅ Webhook-driven order creation
- ✅ Email notifications to user's account email
- ✅ Order history shows purchased location lists
- ✅ Pretty order IDs (sequential per store)

---

## 🌐 **User Flows - Location Lists**

### **Seller Workflow**
1. **Create Account** → Connect Stripe → Create Store
2. **New List** → Add name, description, price (USD), cover image
3. **Add Categories** → Name + emoji (🍽️ Restaurants, 🎭 Attractions)
4. **Add POIs** → Search Google Places or enter manually with coordinates
5. **Organize** → Assign POIs to categories, add seller notes
6. **Publish** → Set list as "Live" to make available for purchase

### **Buyer Workflow**
1. **Browse Lists** → Visit `/lists` page, filter by seller
2. **Select Currency** → Choose display currency from top navigation
3. **View Details** → See list preview, categories, POI count
4. **Add to Cart** → Single click (no quantity selection)
5. **Checkout** → Automatic email from signed-in account
6. **Purchase** → Payment processed in USD, list appears in order history

### **Currency Experience**
1. **Default Display** → USD for all users initially
2. **Currency Selection** → Globe icon in top navigation
3. **Real-time Conversion** → All prices update immediately
4. **Persistent Choice** → Currency preference saved in localStorage
5. **Accurate Rates** → USD $10 = AUD $15.14 (current market rates)

---

## 🎯 **Current Capabilities - Location Lists Platform**

### **For Sellers**
- ✅ Create and manage location lists with POIs
- ✅ Organize POIs into emoji-categorized groups
- ✅ Use Google Places API for POI discovery
- ✅ Add custom locations with coordinates
- ✅ Set USD pricing with global currency display
- ✅ Track sales and earnings in seller dashboard
- ✅ Manage orders and customer communications

### **For Buyers**
- ✅ Browse curated location lists from multiple sellers
- ✅ View prices in 24+ currencies with real exchange rates
- ✅ Purchase lists with simplified checkout (no quantities)
- ✅ See purchase history with location list details
- ✅ Experience clean, location-focused interface

### **For Platform (MapBuddi)**
- ✅ Collect 10% fees automatically on all list sales
- ✅ Support unlimited location list creators
- ✅ Process payments in USD via Stripe Connect
- ✅ Handle multi-currency display without conversion complexity
- ✅ Provide location-specific marketplace experience

---

## 🔧 **Key File Locations - Updated**

### **Location Lists Core**
- `db/schema.ts` - Location lists, categories, POIs tables
- `app/api/location-lists/` - CRUD API routes for lists
- `components/admin/location-list-editor*` - List creation interface
- `app/account/selling/lists/` - Seller list management pages

### **Currency System**
- `hooks/use-currency.ts` - Currency conversion and formatting
- `components/currency-selector.tsx` - Top navigation currency picker
- `lib/currency.ts` - Currency utilities and supported currencies

### **Google Integration**
- `lib/google-places.ts` - Google Places API integration
- `app/api/places/` - Places search and details endpoints

### **Updated Storefront**
- `app/(storefront)/(main)/lists/` - Location lists browsing
- `app/(storefront)/(main)/list/[listId]/` - Individual list pages
- `components/storefront/location-list-card.tsx` - List display component

---

## 🐛 **Recent Fixes & Issues Resolved**

### **✅ Major Issues Fixed**
- **Server-Side Rendering:** Fixed `useCurrency` hook in client components
- **Currency Conversion:** Updated to real exchange rates (USD $10 = AUD $15.14)
- **Quantity System:** Completely removed - lists purchased once only
- **Cart Interface:** Simplified to Cover | Name | Price | Remove
- **Navigation:** Fixed "Location Lists" link to go to `/lists` page
- **Database Types:** Fixed coordinate storage (decimal vs string)
- **List Updates:** Fixed API errors when updating existing lists
- **Checkout Email:** Automatically uses signed-in user's email
- **Build Errors:** Fixed all TypeScript and ESLint issues

### **✅ UX Improvements**
- **Currency Selector:** Now visible with proper styling in top nav
- **Purchase Flow:** No confusing quantity selectors
- **Cart Editing:** Simple trash icon for removal
- **Price Display:** Consistent currency symbols throughout
- **List Creation:** Streamlined seller interface

---

## 📋 **Recent Major Changes - Location Lists Transformation**

### **Platform Transformation** (December 2025)
- **Complete Migration:** From general digital products to location lists
- **Database Schema:** Added 5 new tables for location list system
- **Google Integration:** Places API for POI search and validation
- **Currency System:** USD backend with multi-currency display
- **UI Overhaul:** Location-focused interface throughout

### **Payment Simplification** (December 2025)
- **USD-Only Backend:** All prices stored and processed in USD
- **Multi-Currency Display:** 24+ currencies with real exchange rates
- **No Quantity System:** One-time purchases only
- **Improved Checkout:** Automatic email from signed-in accounts

### **User Experience** (December 2025)
- **Simplified Cart:** No quantity confusion
- **Currency Selection:** Prominent in top navigation
- **Location Focus:** All UI text updated for location lists
- **Mobile Responsive:** Currency selector and list browsing

---

## 🔮 **Next Phase - Google Maps Sync**

### **🚧 Still To Implement**
- **KML Generation:** Export purchased lists to Google My Maps format
- **Google OAuth:** Authentication for Maps/Drive access
- **One-Click Sync:** Direct import to user's Google My Maps
- **Sync Management:** Toggle sync on/off for purchased lists
- **List Previews:** Map view of POIs without revealing specific locations

### **Technical Requirements**
- **Google APIs:** Drive API, My Maps API
- **OAuth Scopes:** `https://www.googleapis.com/auth/drive.file`
- **KML Structure:** Categories as folders, POIs with custom icons
- **Error Handling:** Graceful fallback to manual KML download

---

## 📞 **For Future Development**

### **Current Status Commands**
```bash
# Work on location lists features
git checkout staging

# Test currency conversion
# Visit: /lists and change currency in top nav

# Test list creation
# Visit: /account/selling/lists/new

# Debug location lists
# Check database: location_lists, list_categories, list_pois tables
```

### **Ready for Google Maps Integration**
- **Database:** All location data properly stored with coordinates
- **UI:** List creation and management interfaces complete  
- **Purchase Flow:** Buyers can successfully purchase location lists
- **Next Step:** Implement KML generation and Google OAuth flow

---

**This document reflects the successful transformation of MapBuddi into a location lists marketplace with simplified currency handling and improved user experience. The platform is ready for the final Google Maps sync implementation.**
