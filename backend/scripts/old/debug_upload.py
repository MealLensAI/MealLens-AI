#!/usr/bin/env python3
"""
Debug script to understand the correct Supabase Storage upload API.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_upload():
    """Debug the Supabase Storage upload API."""
    try:
        from supabase import create_client
        
        # Get Supabase credentials
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Missing credentials")
            return
        
        # Initialize Supabase client directly
        supabase = create_client(supabase_url, supabase_key)
        
        # Create simple test content
        test_content = b"Hello, world!"
        test_path = "debug/test.txt"
        
        print("🔧 Testing different upload methods...")
        
        # Method 1: Simple upload
        try:
            print("1. Trying simple upload...")
            response1 = supabase.storage.from_("food-images").upload(test_path, test_content)
            print(f"   Response 1: {response1} (type: {type(response1)})")
        except Exception as e:
            print(f"   Error 1: {e}")
        
        # Method 2: Upload with file_options
        try:
            print("2. Trying upload with file_options...")
            response2 = supabase.storage.from_("food-images").upload(
                test_path + "2", 
                test_content,
                file_options={"content-type": "text/plain"}
            )
            print(f"   Response 2: {response2} (type: {type(response2)})")
        except Exception as e:
            print(f"   Error 2: {e}")
        
        # Method 3: Upload with named parameters
        try:
            print("3. Trying upload with named parameters...")
            response3 = supabase.storage.from_("food-images").upload(
                path=test_path + "3",
                file=test_content,
                file_options={"content-type": "text/plain"}
            )
            print(f"   Response 3: {response3} (type: {type(response3)})")
        except Exception as e:
            print(f"   Error 3: {e}")
        
        # Check API documentation
        print("\n📚 Checking upload method signature...")
        upload_method = supabase.storage.from_("food-images").upload
        print(f"Upload method: {upload_method}")
        print(f"Upload method docstring: {upload_method.__doc__}")
        
    except Exception as e:
        print(f"❌ Debug failed: {str(e)}")

if __name__ == "__main__":
    debug_upload()