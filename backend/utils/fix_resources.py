#!/usr/bin/env python3
"""
Utility script to fix empty resources in detection_history table.
This script will:
1. Find records with empty resources
2. Fetch resources for the detected foods
3. Update the records with proper resource data
"""

import requests
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(
        host=os.getenv('SUPABASE_HOST'),
        database=os.getenv('SUPABASE_DB'),
        user=os.getenv('SUPABASE_USER'),
        password=os.getenv('SUPABASE_PASSWORD'),
        port=os.getenv('SUPABASE_PORT', '5432')
    )

def fetch_resources_for_food(food_detected):
    """Fetch resources from AI service for given food items"""
    try:
        response = requests.post(
            'https://ai-utu2.onrender.com/food_detect_resources',
            json={'food_detected': food_detected},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching resources: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception fetching resources: {e}")
        return None

def fix_empty_resources():
    """Main function to fix empty resources"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Find records with empty resources
        cursor.execute("""
            SELECT id, detected_foods, suggestion, recipe_type
            FROM detection_history 
            WHERE resources = '{}' OR resources IS NULL OR youtube = '' OR google = ''
            ORDER BY created_at DESC
        """)
        
        records = cursor.fetchall()
        print(f"Found {len(records)} records with empty resources")
        
        fixed_count = 0
        
        for record in records:
            try:
                # Parse detected foods
                detected_foods = []
                if record['detected_foods']:
                    detected_foods = json.loads(record['detected_foods'])
                elif record['suggestion']:
                    detected_foods = [food.strip() for food in record['suggestion'].split(',')]
                
                if not detected_foods:
                    print(f"Skipping record {record['id']} - no detected foods")
                    continue
                
                print(f"Fetching resources for: {detected_foods}")
                
                # Fetch resources
                resources_data = fetch_resources_for_food(detected_foods)
                
                if resources_data:
                    # Extract first YouTube and Google links
                    youtube_link = ""
                    google_link = ""
                    
                    if resources_data.get('YoutubeSearch') and len(resources_data['YoutubeSearch']) > 0:
                        youtube_link = resources_data['YoutubeSearch'][0].get('link', '')
                    
                    if resources_data.get('GoogleSearch') and len(resources_data['GoogleSearch']) > 0:
                        google_link = resources_data['GoogleSearch'][0].get('link', '')
                    
                    # Update the record
                    cursor.execute("""
                        UPDATE detection_history 
                        SET 
                            youtube = %s,
                            google = %s,
                            resources = %s
                        WHERE id = %s
                    """, (
                        youtube_link,
                        google_link,
                        json.dumps(resources_data),
                        record['id']
                    ))
                    
                    conn.commit()
                    fixed_count += 1
                    print(f"✅ Fixed record {record['id']}")
                else:
                    print(f"❌ Failed to fetch resources for record {record['id']}")
                    
            except Exception as e:
                print(f"❌ Error processing record {record['id']}: {e}")
                conn.rollback()
        
        print(f"\n🎉 Fixed {fixed_count} out of {len(records)} records")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🔧 Starting resource fix utility...")
    fix_empty_resources()
    print("✅ Resource fix utility completed!") 