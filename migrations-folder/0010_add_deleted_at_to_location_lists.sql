-- Add deletedAt column to location_lists table for soft delete tracking
ALTER TABLE "location_lists" ADD COLUMN "deleted_at" timestamp;

-- Add comment for clarity
COMMENT ON COLUMN "location_lists"."deleted_at" IS 'Soft delete timestamp - if set, the list is considered deleted but preserved for record keeping';

