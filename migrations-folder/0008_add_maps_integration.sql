-- Create user_maps_integration table
CREATE TABLE IF NOT EXISTS "user_maps_integration" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"google_maps_connected" boolean DEFAULT false,
	"google_access_token" text,
	"google_refresh_token" text,
	"google_token_expiry" timestamp,
	"google_drive_connected" boolean DEFAULT false,
	"apple_maps_connected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create purchased_list_sync table
CREATE TABLE IF NOT EXISTS "purchased_list_sync" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"order_id" integer NOT NULL,
	"list_id" integer NOT NULL,
	"google_maps_synced" boolean DEFAULT false,
	"google_maps_map_id" text,
	"google_maps_last_sync" timestamp,
	"google_maps_sync_enabled" boolean DEFAULT false,
	"apple_maps_sync" boolean DEFAULT false,
	"apple_maps_last_sync" timestamp,
	"apple_maps_sync_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "user_maps_integration_user_id_idx" ON "user_maps_integration" ("user_id");
CREATE INDEX IF NOT EXISTS "purchased_list_sync_user_id_idx" ON "purchased_list_sync" ("user_id");
CREATE INDEX IF NOT EXISTS "purchased_list_sync_order_id_idx" ON "purchased_list_sync" ("order_id");
CREATE INDEX IF NOT EXISTS "purchased_list_sync_list_id_idx" ON "purchased_list_sync" ("list_id");
