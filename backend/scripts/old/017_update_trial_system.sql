-- Update trial system to start from first detection instead of registration
-- This script updates the can_use_feature function to handle trial properly

-- Drop the existing function
DROP FUNCTION IF EXISTS public.can_use_feature(UUID, TEXT);

-- Recreate the function with proper trial handling
CREATE OR REPLACE FUNCTION public.can_use_feature(p_user_id UUID, p_feature_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_sub JSONB;
    plan_limits JSONB;
    current_usage INTEGER;
    limit_value INTEGER;
    result JSONB;
    first_usage_date TIMESTAMP WITH TIME ZONE;
    trial_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if user has any usage recorded (to determine if trial started)
    SELECT MIN(created_at) INTO first_usage_date
    FROM public.usage_tracking
    WHERE user_id = p_user_id;
    
    -- If no usage recorded yet, user is new and can use features
    IF first_usage_date IS NULL THEN
        RETURN jsonb_build_object(
            'can_use', true,
            'current_usage', 0,
            'limit', -1,
            'remaining', -1,
            'message', 'New user - trial not started'
        );
    END IF;
    
    -- Check if user is in trial period (3 days from first usage)
    trial_end_date := first_usage_date + INTERVAL '3 days';
    
    IF NOW() < trial_end_date THEN
        RETURN jsonb_build_object(
            'can_use', true,
            'current_usage', 0,
            'limit', -1,
            'remaining', -1,
            'message', 'In trial period'
        );
    END IF;
    
    -- Trial expired, check subscription and limits
    user_sub := public.get_user_subscription(p_user_id);
    
    -- If no subscription, use free plan
    IF user_sub = '{}'::jsonb THEN
        SELECT limits INTO plan_limits
        FROM public.subscription_plans
        WHERE name = 'free';
    ELSE
        plan_limits := user_sub->'plan'->'limits';
    END IF;
    
    -- Get current usage for this month
    SELECT COALESCE(SUM(usage_count), 0) INTO current_usage
    FROM public.usage_tracking
    WHERE user_id = p_user_id
    AND feature_name = p_feature_name
    AND usage_date >= DATE_TRUNC('month', CURRENT_DATE);
    
    -- Get limit for this feature
    limit_value := (plan_limits->>(p_feature_name || '_per_month'))::INTEGER;
    
    -- Check if unlimited (-1) or within limit
    IF limit_value = -1 OR current_usage < limit_value THEN
        result := jsonb_build_object(
            'can_use', true,
            'current_usage', current_usage,
            'limit', limit_value,
            'remaining', CASE WHEN limit_value = -1 THEN -1 ELSE limit_value - current_usage END
        );
    ELSE
        result := jsonb_build_object(
            'can_use', false,
            'current_usage', current_usage,
            'limit', limit_value,
            'remaining', 0,
            'message', 'Usage limit exceeded for this month'
        );
    END IF;
    
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.can_use_feature(UUID, TEXT) TO authenticated, anon;

-- Update subscription plans to ensure proper pricing
UPDATE public.subscription_plans 
SET 
    price_weekly = 2.50,
    price_two_weeks = 5.00,
    price_monthly = 10.00,
    currency = 'USD'
WHERE name IN ('weekly', 'two_weeks', 'monthly');

-- Ensure free plan exists with proper limits
INSERT INTO public.subscription_plans (
    id, name, display_name, description, price_weekly, price_two_weeks, price_monthly, 
    currency, features, limits, is_active, duration_days, billing_cycle
) VALUES (
    gen_random_uuid(), 'free', 'Free Plan', 'Basic features with limited usage',
    0, 0, 0, 'USD', 
    '["Basic Food Detection", "Limited AI Kitchen Assistant", "Basic Meal Planning"]',
    '{"food_detection_per_month": 3, "ingredient_detection_per_month": 3, "meal_planning_per_month": 1}',
    true, 0, 'free'
) ON CONFLICT (name) DO UPDATE SET
    limits = '{"food_detection_per_month": 3, "ingredient_detection_per_month": 3, "meal_planning_per_month": 1}',
    currency = 'USD';

-- Create index for better performance on trial checks
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_first_usage 
ON public.usage_tracking(user_id, created_at);

COMMENT ON FUNCTION public.can_use_feature(UUID, TEXT) IS 'Check if user can use a feature with proper trial handling starting from first detection'; 