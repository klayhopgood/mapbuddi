// schema.ts
import { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    name: varchar("store_name", { length: 40 }),
    industry: text("industry"), // Will be deprecated in favor of nationality
    nationality: text("nationality"), // JSON array of countries
    description: text("description"),
    profileImage: text("profile_image"), // URL to profile image
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    age: integer("age"),
    socialLinks: text("social_links"), // JSON object with YouTube, TikTok, Instagram URLs
    verifiedSocials: text("verified_socials"), // JSON array of verified platforms
    slug: varchar("slug", { length: 50 }),
    userId: text("user_id"), // Clerk user ID
    currency: varchar("currency", { length: 3 }).default("USD"), // ISO currency code
  },
  (table) => {
    return {
      storeNameIndex: uniqueIndex("store_name_index").on(table.name),
      storeSlugIndex: uniqueIndex("store_slug_index").on(table.slug),
    };
  }
);

export type Store = InferSelectModel<typeof stores>;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  description: text("description"),
  images: json("images"),
  storeId: integer("store_id"),
});
export type Product = InferSelectModel<typeof products>;

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  items: json("items"),
  paymentIntentId: text("payment_intent_id"),
  clientSecret: text("client_secret"),
  isClosed: boolean("is_closed").default(false),
  userId: text("user_id"), // Clerk user ID
});
export type Cart = InferSelectModel<typeof carts>;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id"),
  stripeAccountId: text("stripe_account_id"),
  stripeAccountCreatedAt: integer("stripe_account_created_at"),
  stripeAccountExpiresAt: integer("stripe_account_expires_at"),
  details_submitted: boolean("details_submitted").default(false),
});

export type Payment = InferSelectModel<typeof payments>;

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    prettyOrderId: integer("pretty_order_id"),
    storeId: integer("store_id"),
    items: json("items"),
    total: decimal("total", { precision: 10, scale: 2 }).default("0"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 256 }),
    stripePaymentIntentStatus: text("stripe_payment_intent_status"),
    name: text("name"),
    email: text("email"),
    createdAt: integer("created_at"),
    addressId: integer("address"),
  },
  (table) => {
    return {
      stripePaymentIntentIdIndex: uniqueIndex(
        "stripe_payment_intent_id_index"
      ).on(table.stripePaymentIntentId),
    };
  }
);

export type Order = InferSelectModel<typeof orders>;

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  line1: text("line1"),
  line2: text("line2"),
  city: text("city"),
  state: text("state"),
  postal_code: text("postal_code"),
  country: text("country"),
});

export type Address = InferSelectModel<typeof addresses>;

// Location Lists Tables
export const locationLists = pgTable("location_lists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"), // ISO currency code
  coverImage: text("cover_image"),
  storeId: integer("store_id").notNull(),
  isActive: boolean("is_active").default(true),
  totalPois: integer("total_pois").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }),
  country: varchar("country", { length: 100 }), // Country name
  cities: text("cities"), // JSON array of city names
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type LocationList = InferSelectModel<typeof locationLists>;

// Countries reference table
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 2 }).notNull(), // ISO country code (US, GB, etc.)
  region: varchar("region", { length: 50 }), // Continent/region
});

export type Country = InferSelectModel<typeof countries>;

// States/Provinces reference table
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }), // State/province code (CA, NY, ON, etc.)
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
}, (table) => {
  return {
    countryIndex: index("states_country_index").on(table.countryCode),
    nameIndex: index("states_name_index").on(table.name),
  };
});

export type State = InferSelectModel<typeof states>;

// Cities reference table
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
  stateCode: varchar("state_code", { length: 10 }), // Can be null for countries without states
  stateName: varchar("state_name", { length: 100 }), // Can be null
  population: integer("population"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
}, (table) => {
  return {
    countryIndex: index("cities_country_index").on(table.countryCode),
    stateIndex: index("cities_state_index").on(table.stateCode),
    nameIndex: index("cities_name_index").on(table.name),
  };
});

export type City = InferSelectModel<typeof cities>;

export const listCategories = pgTable("list_categories", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(), // Unicode emoji
  iconColor: varchar("icon_color", { length: 7 }).default("#FF0000"), // Hex color
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ListCategory = InferSelectModel<typeof listCategories>;

export const listPois = pgTable("list_pois", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  sellerNotes: text("seller_notes"), // Custom notes from the seller
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  googlePlaceId: text("google_place_id"), // For POIs from Google Places API
  address: text("address"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ListPoi = InferSelectModel<typeof listPois>;

export const purchasedLists = pgTable("purchased_lists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  listId: integer("list_id").notNull(),
  orderId: integer("order_id"), // Link to orders table
  purchaseDate: timestamp("purchase_date").defaultNow(),
  lastSyncDate: timestamp("last_sync_date"),
  syncStatus: varchar("sync_status", { length: 20 }).default("pending"), // pending, synced, failed
  hasCustomModifications: boolean("has_custom_modifications").default(false),
  googleMyMapId: text("google_my_map_id"), // Google My Maps ID for tracking
});

export type PurchasedList = InferSelectModel<typeof purchasedLists>;

// List Reviews
export const listReviews = pgTable("list_reviews", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  userId: text("user_id").notNull(), // Clerk user ID
  userEmail: text("user_email").notNull(), // User email for display purposes
  rating: integer("rating").notNull(), // 1-5 stars
  review: varchar("review", { length: 500 }), // Review text up to 500 characters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    // Ensure a user can only review a list once
    userListReviewIndex: uniqueIndex("user_list_review_index").on(table.userId, table.listId),
  };
});

export type ListReview = InferSelectModel<typeof listReviews>;

// User Preferences (for buyer currency settings)
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Clerk user ID
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserPreferences = InferSelectModel<typeof userPreferences>;

// Seller payout tracking
export const sellerPayouts = pgTable("seller_payouts", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  orderId: integer("order_id").notNull(),
  sellerId: text("seller_id").notNull(), // Clerk user ID
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Amount to pay seller (after fees)
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // Platform fee taken
  stripeFee: decimal("stripe_fee", { precision: 10, scale: 2 }).notNull(), // Stripe fee
  payoutMethod: varchar("payout_method", { length: 20 }).notNull(), // paypal, bank_us, bank_uk, bank_eu, bank_au
  payoutDetails: text("payout_details"), // JSON with payout-specific details
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, failed
  payoutDate: timestamp("payout_date"),
  transactionId: text("transaction_id"), // PayPal/Stripe transfer ID
  failureReason: text("failure_reason"), // If payout fails
  createdAt: timestamp("created_at").defaultNow(),
});

export type SellerPayout = InferSelectModel<typeof sellerPayouts>;

// Seller payout methods (replaces storePaymentSettings)
export const sellerPayoutMethods = pgTable("seller_payout_methods", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().unique(),
  sellerId: text("seller_id").notNull(), // Clerk user ID
  
  // PayPal (available worldwide)
  paypalEmail: text("paypal_email"),
  paypalVerified: boolean("paypal_verified").default(false), // Track if PayPal email is verified
  
  // US Banking
  usRoutingNumber: text("us_routing_number"), // 9 digits
  usAccountNumber: text("us_account_number"),
  usAccountType: varchar("us_account_type", { length: 10 }), // checking, savings
  
  // UK Banking  
  ukSortCode: text("uk_sort_code"), // 6 digits (XX-XX-XX)
  ukAccountNumber: text("uk_account_number"), // 8 digits
  
  // European Banking (IBAN)
  euIban: text("eu_iban"), // Up to 34 characters
  euBic: text("eu_bic"), // 8-11 characters (optional for SEPA)
  
  // Australian Banking
  auBsb: text("au_bsb"), // 6 digits (XXX-XXX)
  auAccountNumber: text("au_account_number"),
  
  // Account holder details (required for all banking)
  accountHolderName: text("account_holder_name"),
  accountHolderAddress: text("account_holder_address"), // JSON with address
  
  // Preferred method
  preferredMethod: varchar("preferred_method", { length: 20 }).default("paypal"), // paypal, bank_us, bank_uk, bank_eu, bank_au
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SellerPayoutMethods = InferSelectModel<typeof sellerPayoutMethods>;

// User Maps Integration
export const userMapsIntegration = pgTable("user_maps_integration", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  
  // Google Maps Integration
  googleMapsConnected: boolean("google_maps_connected").default(false),
  googleAccessToken: text("google_access_token"), // OAuth token
  googleRefreshToken: text("google_refresh_token"), // OAuth refresh token
  googleTokenExpiry: timestamp("google_token_expiry"),
  googleDriveConnected: boolean("google_drive_connected").default(false),
  
  // Apple Maps Integration (future)
  appleMapsConnected: boolean("apple_maps_connected").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserMapsIntegration = InferSelectModel<typeof userMapsIntegration>;

// Purchased List Sync Status
export const purchasedListSync = pgTable("purchased_list_sync", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  orderId: integer("order_id").notNull(), // Reference to orders table
  listId: integer("list_id").notNull(), // Reference to location_lists table
  
  // Google Maps Sync
  googleMapsSynced: boolean("google_maps_synced").default(false),
  googleMapsMapId: text("google_maps_map_id"), // Google My Maps ID
  googleMapsLastSync: timestamp("google_maps_last_sync"),
  googleMapsSyncEnabled: boolean("google_maps_sync_enabled").default(false),
  
  // Apple Maps Sync (future)
  appleMapsSync: boolean("apple_maps_sync").default(false),
  appleMapsLastSync: timestamp("apple_maps_last_sync"),
  appleMapsSyncEnabled: boolean("apple_maps_sync_enabled").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PurchasedListSync = InferSelectModel<typeof purchasedListSync>;
