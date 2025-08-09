#!/usr/bin/env python3
"""
Script to add image_data column to detection_history table
"""

import os
import sys
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_service import SupabaseService

def apply_image_migration():
    """Apply the image_data migration to detection_history table"""
    
    # Load environment variables
    load_dotenv()
    
    # Initialize Supabase service
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        return False
    
    try:
        supabase_service = SupabaseService(supabase_url, supabase_key)
        
        # SQL to add image_data column
        sql = """
        -- Add image field to detection_history table for storing compressed images
        ALTER TABLE public.detection_history 
        ADD COLUMN IF NOT EXISTS image_data TEXT; -- Base64 encoded compressed image

        -- Add index for better performance when querying by image
        CREATE INDEX IF NOT EXISTS idx_detection_history_image_data 
        ON public.detection_history(image_data) 
        WHERE image_data IS NOT NULL;

        -- Update the detection_history table comment
        COMMENT ON COLUMN public.detection_history.image_data IS 'Base64 encoded compressed image data for cover art';
        """
        
        print("Applying image_data migration...")
        
        # Execute the SQL using Supabase client
        result = supabase_service.supabase.rpc('exec_sql', {'sql': sql}).execute()
        
        print("Migration applied successfully!")
        print("Result:", result)
        
        return True
        
    except Exception as e:
        print(f"Error applying migration: {e}")
        return False

if __name__ == "__main__":
    success = apply_image_migration()
    if success:
        print("✅ Image migration completed successfully!")
    else:
        print("❌ Image migration failed!")
        sys.exit(1) 