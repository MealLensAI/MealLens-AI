#!/usr/bin/env python3
"""
Script to set up payment tables in Supabase
"""

import os
import sys
from supabase import create_client

def setup_payment_tables():
    """Set up payment tables in Supabase"""
    
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
        
        # Payment tables SQL
        payment_tables_sql = """
        -- Create payment_transactions table
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

        -- Create paystack_webhooks table
        CREATE TABLE IF NOT EXISTS public.paystack_webhooks (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            event_type text NOT NULL,
            paystack_event_id text,
            paystack_reference text,
            event_data jsonb,
            processed boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now()
        );

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

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(paystack_reference);
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
        CREATE INDEX IF NOT EXISTS idx_paystack_webhooks_reference ON public.paystack_webhooks(paystack_reference);
        """
        
        # Execute SQL
        print("🔧 Setting up payment tables...")
        result = supabase.rpc('exec_sql', {'sql': payment_tables_sql}).execute()
        
        print("✅ Payment tables setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error setting up payment tables: {e}")
        return False

if __name__ == "__main__":
    success = setup_payment_tables()
    sys.exit(0 if success else 1) 