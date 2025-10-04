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
