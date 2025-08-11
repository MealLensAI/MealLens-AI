#!/usr/bin/env python3
"""
Test script to debug backend connectivity from different origins.
"""

import requests
import json

def test_backend_connection(backend_url, origin=None):
    """Test connection to backend with optional origin header."""
    headers = {}
    if origin:
        headers['Origin'] = origin
    
    print(f"\n🔍 Testing connection to: {backend_url}")
    print(f"📡 Origin header: {origin or 'None'}")
    
    try:
        # Test health endpoint
        response = requests.get(f"{backend_url}/api/health", headers=headers, timeout=10)
        print(f"✅ Health check: {response.status_code}")
        print(f"📄 Response: {response.text[:200]}...")
        
        # Test simple endpoint
        response = requests.get(f"{backend_url}/api/test", headers=headers, timeout=10)
        print(f"✅ Test endpoint: {response.status_code}")
        print(f"📄 Response: {response.text[:200]}...")
        
        # Test OPTIONS (preflight)
        response = requests.options(f"{backend_url}/api/test", headers=headers, timeout=10)
        print(f"✅ OPTIONS request: {response.status_code}")
        print(f"📄 CORS headers: {dict(response.headers)}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    # Test with different origins
    backend_url = "https://meallens-backend.onrender.com"  # Update this to your actual backend URL
    
    print("🚀 Testing backend connectivity...")
    
    # Test without origin header
    test_backend_connection(backend_url)
    
    # Test with localhost origin
    test_backend_connection(backend_url, "http://localhost:5173")
    
    # Test with production origin
    test_backend_connection(backend_url, "https://meallensai.com")
    
    # Test with Vercel origin
    test_backend_connection(backend_url, "https://new-meallensai.vercel.app")
    
    print("\n✨ Testing complete!")
