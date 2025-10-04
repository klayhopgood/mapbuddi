CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"line1" text,
	"line2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"items" json,
	"payment_intent_id" text,
	"client_secret" text,
	"is_closed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"pretty_order_id" integer,
	"store_id" integer,
	"items" json,
	"total" numeric(10, 2) DEFAULT '0',
	"stripe_payment_intent_id" varchar(256),
	"stripe_payment_intent_status" text,
	"name" text,
	"email" text,
	"created_at" integer,
	"address" integer
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"stripe_account_id" text,
	"stripe_account_created_at" integer,
	"stripe_account_expires_at" integer,
	"details_submitted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"price" numeric(10, 2) DEFAULT '0',
	"description" text,
	"inventory" numeric DEFAULT '0',
	"images" json,
	"store_id" integer
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_name" varchar(40),
	"industry" text,
	"description" text,
	"slug" varchar(50)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_payment_intent_id_index" ON "orders" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "store_name_index" ON "stores" USING btree ("store_name");--> statement-breakpoint
CREATE UNIQUE INDEX "store_slug_index" ON "stores" USING btree ("slug");