-- Force update subscription plans with new pricing and duration-based system
-- This script will completely replace the existing plans

-- First, add new columns to subscription_plans table if they don't exist
DO $$ 
BEGIN
    -- Add duration_days column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'duration_days') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN duration_days INTEGER DEFAULT 30;
    END IF;
    
    -- Add billing_cycle column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'billing_cycle') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
    END IF;
END $$;

-- Delete all existing plans
DELETE FROM public.subscription_plans;

-- Then insert the new plans with duration-based pricing
INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, features, limits, duration_days, billing_cycle) VALUES
('free', 'Free Plan', 0.00, 0.00, 
 '{"food_detection": true, "recipe_generation": true, "basic_support": true}',
 '{"food_detection_per_week": 3, "meal_planning_per_week": 0, "recipe_generation_per_week": 5}',
 0, 'trial'),
('weekly', 'Weekly Plan', 2.50, 0.00,
 '{"food_detection": true, "meal_planning": true, "recipe_generation": true, "priority_support": true}',
 '{"food_detection_per_week": -1, "meal_planning_per_week": -1, "recipe_generation_per_week": -1}',
 7, 'weekly'),
('two_weeks', 'Two-Week Plan', 4.50, 0.00,
 '{"food_detection": true, "meal_planning": true, "recipe_generation": true, "priority_support": true}',
 '{"food_detection_per_week": -1, "meal_planning_per_week": -1, "recipe_generation_per_week": -1}',
 14, 'bi_weekly'),
('monthly', 'Monthly Plan', 8.00, 0.00,
 '{"food_detection": true, "meal_planning": true, "recipe_generation": true, "priority_support": true}',
 '{"food_detection_per_week": -1, "meal_planning_per_week": -1, "recipe_generation_per_week": -1}',
 30, 'monthly');



-- Add new columns to user_subscriptions table for enhanced tracking
DO $$ 
BEGIN
    -- Add free_trial_start column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'free_trial_start') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN free_trial_start TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add free_trial_end column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'free_trial_end') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN free_trial_end TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add free_tier_reset_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'free_tier_reset_date') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN free_tier_reset_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add free_usage_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'free_usage_count') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN free_usage_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add subscription_duration_days column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'subscription_duration_days') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN subscription_duration_days INTEGER DEFAULT 30;
    END IF;
END $$;

-- Verify the update
SELECT name, display_name, price_monthly, duration_days, billing_cycle FROM public.subscription_plans ORDER BY price_monthly; 