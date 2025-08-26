#!/usr/bin/env python3
"""
Script to set up Supabase Storage bucket for food detection images.
Run this once to create the necessary storage bucket.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the parent directory to Python path to import our services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def setup_storage_bucket():
    """Set up the food-images bucket in Supabase Storage."""
    try:
        from services.supabase_service import SupabaseService
        
        # Get Supabase credentials
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
            print("💡 Make sure your .env file is configured correctly")
            return False
        
        print("🔧 Setting up Supabase Storage bucket for food images...")
        
        # Initialize Supabase service
        supabase_service = SupabaseService(supabase_url, supabase_key)
        
        # Try to create the bucket (this might fail if it already exists)
        try:
            bucket_response = supabase_service.supabase.storage.create_bucket("food-images", {
                "public": True,  # Make bucket public so images can be accessed directly
                "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp"],
                "fileSizeLimit": 5242880  # 5MB limit
            })
            print("✅ Created 'food-images' bucket successfully")
        except Exception as bucket_error:
            if "already exists" in str(bucket_error).lower():
                print("ℹ️  'food-images' bucket already exists")
            else:
                print(f"⚠️  Bucket creation issue: {bucket_error}")
        
        # Test bucket access
        try:
            buckets = supabase_service.supabase.storage.list_buckets()
            food_images_bucket = next((b for b in buckets if b.name == "food-images"), None)
            
            if food_images_bucket:
                print("✅ 'food-images' bucket is accessible")
                print(f"   - Bucket ID: {food_images_bucket.id}")
                print(f"   - Public: {food_images_bucket.public}")
                
                # Test upload permissions by uploading a small test file
                test_content = b"test image content"
                test_filename = "test/connection_test.txt"
                
                try:
                    upload_response = supabase_service.supabase.storage.from_("food-images").upload(
                        test_filename, test_content, {"content-type": "text/plain"}
                    )
                    
                    if upload_response.status_code == 200:
                        print("✅ Upload test successful")
                        
                        # Clean up test file
                        supabase_service.supabase.storage.from_("food-images").remove([test_filename])
                        print("✅ Test file cleaned up")
                    else:
                        print(f"⚠️  Upload test failed: {upload_response}")
                        
                except Exception as upload_error:
                    print(f"⚠️  Upload test failed: {upload_error}")
            else:
                print("❌ 'food-images' bucket not found")
                return False
                
        except Exception as list_error:
            print(f"❌ Failed to list buckets: {list_error}")
            return False
        
        print("\n🎉 Storage setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Make sure RLS policies allow authenticated users to upload images")
        print("2. Test image upload from your application")
        print("3. Monitor storage usage in Supabase dashboard")
        
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        return False

def print_storage_policies():
    """Print the recommended RLS policies for the storage bucket."""
    print("\n📋 Recommended RLS Policies for 'food-images' bucket:")
    print("=" * 60)
    print()
    print("1. Allow authenticated users to upload images:")
    print("   Name: Users can upload food images")
    print("   Policy: INSERT")
    print("   SQL: (auth.role() = 'authenticated')")
    print()
    print("2. Allow public read access to images:")
    print("   Name: Public can view food images") 
    print("   Policy: SELECT")
    print("   SQL: true")
    print()
    print("3. Allow users to delete their own images:")
    print("   Name: Users can delete their own images")
    print("   Policy: DELETE")
    print("   SQL: auth.uid()::text = (storage.foldername(name))[2]")
    print()
    print("💡 Apply these policies in your Supabase Dashboard > Storage > food-images > Policies")

if __name__ == "__main__":
    print("🚀 MealLens AI - Supabase Storage Setup")
    print("=" * 50)
    
    success = setup_storage_bucket()
    
    if success:
        print_storage_policies()
    else:
        print("\n❌ Setup failed. Please check your configuration and try again.")
        sys.exit(1)