-- Add image_url column to detection_history table
-- This will store Supabase Storage URLs for food detection images

-- Add the new column
ALTER TABLE detection_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN detection_history.image_url IS 'URL to the uploaded food image in Supabase Storage';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_detection_history_image_url 
ON detection_history(image_url) 
WHERE image_url IS NOT NULL;

-- Update the RLS policies if needed (they should already allow all operations for authenticated users)

-- Optional: Clean up old records that might have large base64 data in image_data
-- (Uncomment if you want to clean up existing base64 data after migration)
-- UPDATE detection_history 
-- SET image_data = NULL 
-- WHERE image_url IS NOT NULL AND length(image_data) > 1000;
