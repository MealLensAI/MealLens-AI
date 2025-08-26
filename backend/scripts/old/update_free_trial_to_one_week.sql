-- ================================================
-- Update Free Trial Duration to 1 Week for All Users
-- ================================================

-- This script updates all free users to have a 1-week trial period
-- instead of the current 3-day trial

-- Step 1: Update users who are currently in their trial period
-- Extend their trial end date by 4 more days (3 days + 4 days = 7 days total)
UPDATE public.user_subscriptions 
SET 
    free_trial_end = free_trial_start + INTERVAL '7 days',
    updated_at = NOW()
WHERE 
    status = 'active' 
    AND plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND free_trial_end IS NOT NULL
    AND free_trial_end > NOW(); -- Only update users still in trial

-- Step 2: Update users who haven't started their trial yet
-- Set their trial end date to 7 days from now
UPDATE public.user_subscriptions 
SET 
    free_trial_end = NOW() + INTERVAL '7 days',
    updated_at = NOW()
WHERE 
    status = 'active' 
    AND plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND free_trial_end IS NULL
    AND free_trial_start IS NULL; -- Users who haven't started trial

-- Step 3: Update users who are in trial but haven't set trial start date
-- Set trial start to now and trial end to 7 days from now
UPDATE public.user_subscriptions 
SET 
    free_trial_start = NOW(),
    free_trial_end = NOW() + INTERVAL '7 days',
    updated_at = NOW()
WHERE 
    status = 'active' 
    AND plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND free_trial_start IS NULL
    AND free_trial_end IS NULL; -- Users with no trial dates set

-- Step 4: For users who have completed their trial but are still on free plan
-- Reset their trial to start from now with 7 days
UPDATE public.user_subscriptions 
SET 
    free_trial_start = NOW(),
    free_trial_end = NOW() + INTERVAL '7 days',
    free_usage_count = 0, -- Reset usage count
    updated_at = NOW()
WHERE 
    status = 'active' 
    AND plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND (free_trial_end IS NULL OR free_trial_end < NOW()); -- Trial expired or never set

-- Step 5: Update the subscription plans table to reflect the new trial duration
-- This ensures new users get the 1-week trial
UPDATE public.subscription_plans 
SET 
    features = jsonb_set(
        features, 
        '{trial_days}', 
        '7'::jsonb
    ),
    updated_at = NOW()
WHERE name = 'free';

-- Step 6: Verify the changes
-- Check how many users were updated
SELECT 
    'Users in active trial' as status,
    COUNT(*) as count
FROM public.user_subscriptions 
WHERE 
    status = 'active' 
    AND plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND free_trial_end > NOW()

UNION ALL

SELECT 
    'Users with trial extended' as status,
    COUNT(*) as count
FROM public.user_subscriptions 
WHERE 
    status = 'active' 
    AND plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND free_trial_end IS NOT NULL
    AND free_trial_end > NOW();

-- Step 7: Show sample of updated users
SELECT 
    us.user_id,
    us.free_trial_start,
    us.free_trial_end,
    us.free_usage_count,
    us.updated_at,
    p.email
FROM public.user_subscriptions us
LEFT JOIN public.profiles p ON us.user_id = p.id
WHERE 
    us.status = 'active' 
    AND us.plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'free')
    AND us.free_trial_end > NOW()
ORDER BY us.updated_at DESC
LIMIT 10;

-- ================================================
-- Summary of Changes:
-- ================================================
-- 
-- ✅ All free users now have a 1-week trial period
-- ✅ Trial end dates have been extended for users still in trial
-- ✅ New trial periods set for users who haven't started trial
-- ✅ Usage counts reset for users who completed their old trial
-- ✅ Subscription plan features updated to reflect 7-day trial
-- 
-- ================================================ 