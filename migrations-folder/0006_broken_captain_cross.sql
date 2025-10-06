CREATE TABLE "seller_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"seller_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"stripe_fee" numeric(10, 2) NOT NULL,
	"paypal_email" text,
	"status" varchar(20) DEFAULT 'pending',
	"payout_date" timestamp,
	"paypal_transaction_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "store_payment_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"paypal_email" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "store_payment_settings_store_id_unique" UNIQUE("store_id")
);
--> statement-breakpoint
ALTER TABLE "list_pois" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "list_pois" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "list_pois" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "list_pois" DROP COLUMN "photos";