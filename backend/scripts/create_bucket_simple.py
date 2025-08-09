#!/usr/bin/env python3
"""
Simple script to create Supabase Storage bucket for food images.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_bucket():
    """Create the food-images bucket in Supabase Storage."""
    try:
        # Add the parent directory to Python path to import our services
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        from supabase import create_client
        
        # Get Supabase credentials
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
            return False
        
        print("🔧 Creating Supabase Storage bucket for food images...")
        
        # Initialize Supabase client directly
        supabase = create_client(supabase_url, supabase_key)
        
        # Try to create the bucket
        try:
            bucket_response = supabase.storage.create_bucket("food-images")
            print("✅ Created 'food-images' bucket successfully")
            print(f"   Response: {bucket_response}")
        except Exception as bucket_error:
            error_str = str(bucket_error).lower()
            if "already exists" in error_str or "duplicate" in error_str:
                print("ℹ️  'food-images' bucket already exists")
            else:
                print(f"⚠️  Bucket creation issue: {bucket_error}")
        
        # Test bucket access
        try:
            buckets = supabase.storage.list_buckets()
            food_images_bucket = next((b for b in buckets if b.name == "food-images"), None)
            
            if food_images_bucket:
                print("✅ 'food-images' bucket is accessible")
                print(f"   - Bucket ID: {food_images_bucket.id}")
                print(f"   - Public: {food_images_bucket.public}")
                return True
            else:
                print("❌ 'food-images' bucket not found")
                return False
                
        except Exception as list_error:
            print(f"❌ Failed to list buckets: {list_error}")
            return False
        
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 MealLens AI - Simple Storage Setup")
    print("=" * 40)
    
    success = create_bucket()
    
    if success:
        print("\n🎉 Storage setup completed successfully!")
    else:
        print("\n❌ Setup failed. Please check your configuration and try again.")
        sys.exit(1)