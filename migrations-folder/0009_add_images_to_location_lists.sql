-- Add images field to location_lists table for multiple images
ALTER TABLE location_lists ADD COLUMN images text;

-- Add comment to clarify the field stores JSON array of image URLs
COMMENT ON COLUMN location_lists.images IS 'JSON array of image URLs for the location list';
