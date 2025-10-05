CREATE TABLE "list_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"icon_color" varchar(7) DEFAULT '#FF0000',
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "list_pois" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"seller_notes" text,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"google_place_id" text,
	"address" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "list_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cover_image" text,
	"store_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"total_pois" integer DEFAULT 0,
	"avg_rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchased_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"list_id" integer NOT NULL,
	"order_id" integer,
	"purchase_date" timestamp DEFAULT now(),
	"last_sync_date" timestamp,
	"sync_status" varchar(20) DEFAULT 'pending',
	"has_custom_modifications" boolean DEFAULT false,
	"google_my_map_id" text
);
