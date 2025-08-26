#!/usr/bin/env python3
"""
Script to apply trial system update to the database.
This updates the can_use_feature function to handle trial properly.
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

def apply_trial_update():
    """Apply the trial system update to the database."""
    
    # Get database connection details from environment
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Connected to database successfully")
        
        # Read and execute the SQL script
        script_path = os.path.join(os.path.dirname(__file__), '017_update_trial_system.sql')
        
        with open(script_path, 'r') as f:
            sql_script = f.read()
        
        print("Executing trial system update...")
        cursor.execute(sql_script)
        
        print("✅ Trial system update applied successfully!")
        
        # Verify the function was updated
        cursor.execute("""
            SELECT routine_name, routine_definition 
            FROM information_schema.routines 
            WHERE routine_name = 'can_use_feature' 
            AND routine_schema = 'public'
        """)
        
        result = cursor.fetchone()
        if result:
            print("✅ can_use_feature function updated successfully")
        else:
            print("❌ can_use_feature function not found")
        
        # Check subscription plans
        cursor.execute("SELECT name, price_weekly, price_two_weeks, price_monthly, currency FROM subscription_plans")
        plans = cursor.fetchall()
        
        print("\n📋 Current subscription plans:")
        for plan in plans:
            print(f"  - {plan[0]}: Weekly=${plan[1]}, Two Weeks=${plan[2]}, Monthly=${plan[3]} ({plan[4]})")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Trial system update completed successfully!")
        
    except Exception as e:
        print(f"❌ Error applying trial system update: {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_trial_update() 