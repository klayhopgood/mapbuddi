CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"preferred_currency" varchar(3) DEFAULT 'USD',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "location_lists" ADD COLUMN "currency" varchar(3) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "currency" varchar(3) DEFAULT 'USD';