-- Setup Payment Database Tables
-- Run this in your Supabase SQL Editor to enable payment system

-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    paystack_reference TEXT,
    paystack_subscription_code TEXT,
    amount_paid DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payment_transactions table (if not exists)
-- Note: This table already exists in your database with different structure
-- We'll just ensure it has the necessary columns
DO $$
BEGIN
    -- Add reference column if it doesn't exist (for compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_transactions' 
                   AND column_name = 'reference' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN reference TEXT;
    END IF;
    
    -- Add plan_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_transactions' 
                   AND column_name = 'plan_id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id);
    END IF;
    
    -- Add provider column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_transactions' 
                   AND column_name = 'provider' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.payment_transactions ADD COLUMN provider TEXT DEFAULT 'paystack';
    END IF;
END $$;

-- 4. Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name, usage_date)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_date ON public.usage_tracking(feature_name, usage_date);

-- 6. Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Subscription plans (public read access)
DROP POLICY IF EXISTS "Allow public read access to subscription plans" ON public.subscription_plans;
CREATE POLICY "Allow public read access to subscription plans" 
    ON public.subscription_plans FOR SELECT USING (true);

-- User subscriptions (users can view their own)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
    ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payment transactions (users can view their own)
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their own transactions" 
    ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);

-- Usage tracking (users can view and insert their own)
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage" 
    ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_tracking;
CREATE POLICY "Users can insert their own usage" 
    ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free Plan', 0.00, 0.00, 
 '{"food_detection": true, "ai_kitchen": true, "basic_support": true}',
 '{"food_detection": 5, "meal_planning": 3, "ai_kitchen": 5}'),
('weekly', 'Weekly Plan', 2.50, 0.00,
 '{"food_detection": true, "meal_planning": true, "ai_kitchen": true, "priority_support": true}',
 '{"food_detection": -1, "meal_planning": -1, "ai_kitchen": -1}'),
('two_weeks', 'Two Weeks Plan', 5.00, 0.00,
 '{"food_detection": true, "meal_planning": true, "ai_kitchen": true, "priority_support": true}',
 '{"food_detection": -1, "meal_planning": -1, "ai_kitchen": -1}'),
('monthly', 'Monthly Plan', 10.00, 0.00,
 '{"food_detection": true, "meal_planning": true, "ai_kitchen": true, "priority_support": true}',
 '{"food_detection": -1, "meal_planning": -1, "ai_kitchen": -1}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    updated_at = NOW();

-- 9. Verify tables were created
SELECT 'subscription_plans' as table_name, COUNT(*) as row_count FROM public.subscription_plans
UNION ALL
SELECT 'user_subscriptions' as table_name, COUNT(*) as row_count FROM public.user_subscriptions
UNION ALL
SELECT 'payment_transactions' as table_name, COUNT(*) as row_count FROM public.payment_transactions
UNION ALL
SELECT 'usage_tracking' as table_name, COUNT(*) as row_count FROM public.usage_tracking;