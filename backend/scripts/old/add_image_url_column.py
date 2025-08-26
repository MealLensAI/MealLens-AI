#!/usr/bin/env python3
"""
Script to add image_url column to detection_history table in Supabase.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the parent directory to Python path to import our services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_image_url_column():
    """Add image_url column to detection_history table."""
    try:
        from services.supabase_service import SupabaseService
        
        # Get Supabase credentials
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
            return False
        
        print("🔧 Adding image_url column to detection_history table...")
        
        # Initialize Supabase service
        supabase_service = SupabaseService(supabase_url, supabase_key)
        
        # Check if column already exists
        try:
            # Try to select image_url column - if it fails, column doesn't exist
            result = supabase_service.supabase.table('detection_history').select('image_url').limit(1).execute()
            print("ℹ️  image_url column already exists in detection_history table")
            return True
        except Exception as e:
            if "column" in str(e).lower() and "does not exist" in str(e).lower():
                print("📝 image_url column does not exist, need to add it")
            else:
                print(f"⚠️  Error checking column existence: {e}")
        
        # Column doesn't exist, we need to add it manually via Supabase Dashboard
        print("\n📋 Manual Steps Required:")
        print("=" * 50)
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to Table Editor > detection_history")
        print("3. Click 'Add Column' and create:")
        print("   - Name: image_url")
        print("   - Type: text")
        print("   - Nullable: Yes")
        print("   - Default: NULL")
        print("\n💡 Or run this SQL in the SQL Editor:")
        print("ALTER TABLE detection_history ADD COLUMN image_url TEXT;")
        print("\n🔍 After adding the column, test with a new food detection upload!")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 MealLens AI - Database Migration")
    print("=" * 40)
    
    success = add_image_url_column()
    
    if not success:
        print("\n❌ Migration failed. Please check your configuration and try again.")
        sys.exit(1)