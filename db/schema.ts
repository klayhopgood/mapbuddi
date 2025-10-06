// schema.ts
import { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  decimal,
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
    industry: text("industry"),
    description: text("description"),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type LocationList = InferSelectModel<typeof locationLists>;

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
  rating: decimal("rating", { precision: 2, scale: 1 }), // Google Places rating (e.g., 4.5)
  website: text("website"), // Google Places website URL
  phoneNumber: text("phone_number"), // Google Places phone number
  photos: json("photos"), // Array of Google Places photo URLs
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

// List Reviews (for future implementation)
export const listReviews = pgTable("list_reviews", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  userId: text("user_id").notNull(), // Clerk user ID
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
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
