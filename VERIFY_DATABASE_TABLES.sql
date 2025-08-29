-- MealLens AI Database Table Verification and Creation
-- Run this in your Supabase SQL Editor to ensure all required tables exist

-- Check if tables exist and create them if they don't
DO $$
BEGIN
    -- Check and create user_subscriptions table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
        CREATE TABLE public.user_subscriptions (
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
        RAISE NOTICE 'Created user_subscriptions table';
    ELSE
        RAISE NOTICE 'user_subscriptions table already exists';
    END IF;

    -- Check and create payment_transactions table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_transactions') THEN
        CREATE TABLE public.payment_transactions (
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
        RAISE NOTICE 'Created payment_transactions table';
    ELSE
        RAISE NOTICE 'payment_transactions table already exists';
    END IF;

    -- Check and create paystack_webhooks table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'paystack_webhooks') THEN
        CREATE TABLE public.paystack_webhooks (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            event_type text NOT NULL,
            paystack_event_id text,
            paystack_reference text,
            event_data jsonb,
            processed boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now()
        );
        RAISE NOTICE 'Created paystack_webhooks table';
    ELSE
        RAISE NOTICE 'paystack_webhooks table already exists';
    END IF;

    -- Check and create subscription_plans table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') THEN
        CREATE TABLE public.subscription_plans (
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
        RAISE NOTICE 'Created subscription_plans table';
    ELSE
        RAISE NOTICE 'subscription_plans table already exists';
    END IF;

    -- Check and create usage_tracking table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_tracking') THEN
        CREATE TABLE public.usage_tracking (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            subscription_id uuid,
            feature_name text NOT NULL,
            usage_count integer DEFAULT 1,
            usage_date date NOT NULL DEFAULT CURRENT_DATE,
            metadata jsonb DEFAULT '{}',
            created_at timestamp with time zone DEFAULT now()
        );
        RAISE NOTICE 'Created usage_tracking table';
    ELSE
        RAISE NOTICE 'usage_tracking table already exists';
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON public.usage_tracking(feature_name);

-- Enable RLS on tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paystack_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add RLS policies for payment_transactions
DROP POLICY IF EXISTS "Users can view their own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can insert their own payment transactions" ON public.payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for usage_tracking
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_tracking;
CREATE POLICY "Users can insert their own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Show table status
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'user_subscriptions', 'payment_transactions', 'paystack_webhooks', 'subscription_plans', 'usage_tracking', 'detection_history', 'meal_plan_management', 'sessions') 
        THEN '✅ REQUIRED'
        ELSE '⚠️  OPTIONAL'
    END as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_subscriptions', 'payment_transactions', 'paystack_webhooks', 'subscription_plans', 'usage_tracking', 'detection_history', 'meal_plan_management', 'sessions')
ORDER BY table_name; 