#!/usr/bin/env python3
"""
Database Table Verification Script
Verifies that all required tables exist and are properly configured
"""

import os
import sys
from supabase import create_client

def verify_database_tables():
    """Verify that all required database tables exist"""
    
    # Get Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_service_role_key:
        print("❌ Missing Supabase credentials")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        return False
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_service_role_key)
        print("✅ Connected to Supabase")
        
        # List of required tables
        required_tables = [
            'profiles',
            'user_subscriptions', 
            'payment_transactions',
            'paystack_webhooks',
            'subscription_plans',
            'usage_tracking',
            'detection_history',
            'meal_plan_management',
            'sessions'
        ]
        
        print("\n🔍 Checking required tables...")
        
        for table_name in required_tables:
            try:
                # Try to query the table
                result = supabase.table(table_name).select('*').limit(1).execute()
                print(f"✅ {table_name} - EXISTS")
                
                # Check if table has data
                if result.data:
                    print(f"   📊 Has {len(result.data)} records")
                else:
                    print(f"   📊 Empty table")
                    
            except Exception as e:
                error_msg = str(e)
                if "does not exist" in error_msg.lower():
                    print(f"❌ {table_name} - MISSING")
                    print(f"   Error: {error_msg}")
                else:
                    print(f"⚠️  {table_name} - ERROR")
                    print(f"   Error: {error_msg}")
        
        # Check for any old table names that shouldn't exist
        old_tables = ['subscriptions']  # Old table name that should not exist
        
        print("\n🔍 Checking for old table names...")
        
        for table_name in old_tables:
            try:
                result = supabase.table(table_name).select('*').limit(1).execute()
                print(f"⚠️  {table_name} - EXISTS (should be removed)")
            except Exception as e:
                if "does not exist" in str(e).lower():
                    print(f"✅ {table_name} - CORRECTLY REMOVED")
                else:
                    print(f"❓ {table_name} - UNKNOWN STATUS: {str(e)}")
        
        print("\n✅ Database verification complete!")
        return True
        
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False

def create_missing_tables():
    """Create any missing tables"""
    
    print("\n🔧 Creating missing tables...")
    
    # SQL to create missing tables
    create_tables_sql = """
    -- Create user_subscriptions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.user_subscriptions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
        plan_id text NOT NULL,
        status text DEFAULT 'active',
        start_date timestamp with time zone DEFAULT now(),
        end_date timestamp with time zone,
        paystack_subscription_id text,
        paystack_customer_id text,
        metadata jsonb,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
    );

    -- Create payment_transactions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.payment_transactions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
        paystack_transaction_id text,
        paystack_reference text UNIQUE,
        amount decimal(10,2) NOT NULL,
        currency text DEFAULT 'USD',
        status text DEFAULT 'pending',
        payment_method text,
        description text,
        metadata jsonb,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
    );

    -- Create paystack_webhooks table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.paystack_webhooks (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type text NOT NULL,
        paystack_event_id text,
        paystack_reference text,
        event_data jsonb,
        processed boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now()
    );

    -- Create subscription_plans table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.subscription_plans (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL UNIQUE,
        display_name text NOT NULL,
        price_monthly numeric DEFAULT 0.00,
        price_yearly numeric DEFAULT 0.00,
        features jsonb NOT NULL DEFAULT '{}',
        limits jsonb NOT NULL DEFAULT '{}',
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT now(),
        currency text DEFAULT 'USD',
        updated_at timestamp with time zone DEFAULT now(),
        duration_days integer DEFAULT 30,
        billing_cycle text DEFAULT 'monthly'
    );

    -- Create usage_tracking table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.usage_tracking (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
        subscription_id uuid,
        feature_name text NOT NULL,
        usage_count integer DEFAULT 1,
        usage_date date NOT NULL DEFAULT CURRENT_DATE,
        metadata jsonb DEFAULT '{}',
        created_at timestamp with time zone DEFAULT now()
    );
    """
    
    try:
        # Get Supabase credentials
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_service_role_key:
            print("❌ Missing Supabase credentials")
            return False
        
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_service_role_key)
        
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': create_tables_sql}).execute()
        print("✅ Tables created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        print("Please run the SQL manually in your Supabase dashboard")
        return False

if __name__ == "__main__":
    print("🔍 MealLens AI Database Verification")
    print("=" * 50)
    
    # First verify existing tables
    success = verify_database_tables()
    
    if not success:
        print("\n❌ Database verification failed")
        sys.exit(1)
    
    # Ask if user wants to create missing tables
    response = input("\n🔧 Would you like to create any missing tables? (y/N): ")
    if response.lower() in ['y', 'yes']:
        create_missing_tables()
    
    print("\n✅ Database verification complete!") 