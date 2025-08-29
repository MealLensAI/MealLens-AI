-- Setup missing subscription and usage tracking tables
-- Run this in your Supabase SQL Editor

-- Create usage_tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    feature_name TEXT NOT NULL, -- 'food_detection', 'meal_planning', 'ai_kitchen'
    usage_count INTEGER DEFAULT 1,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name, usage_date)
);

-- Create subscription_plans table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_date ON public.usage_tracking(feature_name, usage_date);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON public.subscription_plans(name);

-- Enable Row Level Security
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage_tracking
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage" 
    ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_tracking;
CREATE POLICY "Users can insert their own usage" 
    ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage" ON public.usage_tracking;
CREATE POLICY "Users can update their own usage" 
    ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for subscription_plans (public read access)
DROP POLICY IF EXISTS "Allow public read access to subscription plans" ON public.subscription_plans;
CREATE POLICY "Allow public read access to subscription plans" 
    ON public.subscription_plans FOR SELECT USING (true);

-- Insert default subscription plans if they don't exist
INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free Plan', 0.00, 0.00, 
 '{"food_detection": true, "ai_kitchen": true, "basic_support": true}',
 '{"food_detection": 5, "meal_planning": 3, "ai_kitchen": 5}'),
('basic', 'Basic Plan', 5.00, 50.00,
 '{"food_detection": true, "meal_planning": true, "ai_kitchen": true, "priority_support": true}',
 '{"food_detection": -1, "meal_planning": 1, "ai_kitchen": 20}'),
('premium', 'Premium Plan', 12.00, 120.00,
 '{"food_detection": true, "meal_planning": true, "ai_kitchen": true, "priority_support": true}',
 '{"food_detection": -1, "meal_planning": -1, "ai_kitchen": -1}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    updated_at = NOW(); 