ALTER TABLE "list_pois" ADD COLUMN "rating" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "list_pois" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "list_pois" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "list_pois" ADD COLUMN "photos" json;