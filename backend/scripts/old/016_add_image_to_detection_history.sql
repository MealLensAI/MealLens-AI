-- Add image field to detection_history table for storing compressed images
ALTER TABLE public.detection_history 
ADD COLUMN IF NOT EXISTS image_data TEXT; -- Base64 encoded compressed image

-- Add index for better performance when querying by image
CREATE INDEX IF NOT EXISTS idx_detection_history_image_data 
ON public.detection_history(image_data) 
WHERE image_data IS NOT NULL;

-- Update the detection_history table comment
COMMENT ON COLUMN public.detection_history.image_data IS 'Base64 encoded compressed image data for cover art'; 