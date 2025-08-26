-- Script to fix empty resources in detection_history table
-- This script identifies records with empty resources and provides a way to update them

-- First, let's see which records have empty resources
SELECT 
    id,
    created_at,
    recipe_type,
    suggestion,
    youtube,
    google,
    resources,
    detected_foods
FROM detection_history 
WHERE resources = '{}' OR resources IS NULL OR youtube = '' OR google = ''
ORDER BY created_at DESC;

-- Update records with empty resources to have at least a placeholder
-- This prevents the frontend from showing empty resource indicators
UPDATE detection_history 
SET 
    resources = '{"GoogleSearch":[],"YoutubeSearch":[]}',
    youtube = '',
    google = ''
WHERE resources = '{}' OR resources IS NULL;

-- Add a comment to the table for future reference
COMMENT ON TABLE detection_history IS 'Updated to fix empty resources - records now have proper JSON structure';

-- Create an index to improve query performance for resource-based searches
CREATE INDEX IF NOT EXISTS idx_detection_history_resources 
ON detection_history USING GIN ((resources::jsonb));

-- Create an index for recipe_type filtering
CREATE INDEX IF NOT EXISTS idx_detection_history_recipe_type 
ON detection_history(recipe_type);

-- Create an index for user_id and created_at for better performance
CREATE INDEX IF NOT EXISTS idx_detection_history_user_created 
ON detection_history(user_id, created_at DESC); 