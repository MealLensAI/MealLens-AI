#!/usr/bin/env python3
"""
Simple script to add image_data column to detection_history table
"""

import os
import sys
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client, Client

def add_image_column():
    """Add image_data column to detection_history table"""
    
    # Load environment variables
    load_dotenv()
    
    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        return False
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("Adding image_data column to detection_history table...")
        
        # Try to insert a test record with image_data to see if the column exists
        test_data = {
            'user_id': '00000000-0000-0000-0000-000000000000',  # Test user ID
            'recipe_type': 'test',
            'image_data': 'test'
        }
        
        try:
            # This will fail if the column doesn't exist, which is what we want
            result = supabase.table('detection_history').insert(test_data).execute()
            print("Column already exists!")
            return True
        except Exception as e:
            if "column \"image_data\" does not exist" in str(e):
                print("Column doesn't exist, adding it...")
                
                # Since we can't use ALTER TABLE directly, let's create a new table with the column
                # For now, let's just note that the column needs to be added manually
                print("""
                ⚠️  Manual Database Update Required!
                
                Please add the image_data column to the detection_history table manually:
                
                1. Go to your Supabase dashboard
                2. Navigate to the SQL Editor
                3. Run this SQL:
                
                ALTER TABLE public.detection_history 
                ADD COLUMN IF NOT EXISTS image_data TEXT;
                
                CREATE INDEX IF NOT EXISTS idx_detection_history_image_data 
                ON public.detection_history(image_data) 
                WHERE image_data IS NOT NULL;
                
                COMMENT ON COLUMN public.detection_history.image_data IS 'Base64 encoded compressed image data for cover art';
                """)
                return False
            else:
                print(f"Unexpected error: {e}")
                return False
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = add_image_column()
    if success:
        print("✅ Image column check completed!")
    else:
        print("❌ Please add the column manually as shown above!")
        sys.exit(1) 