-- ================================================
-- Test Subscription Setup Script
-- Give 3 random users a 1-week premium subscription
-- ================================================

-- First, let's check if we have the weekly plan in subscription_plans
-- If not, we'll create it
INSERT INTO public.subscription_plans (
    name, 
    display_name, 
    price_monthly, 
    price_yearly, 
    features, 
    limits, 
    duration_days, 
    billing_cycle,
    currency
) VALUES (
    'weekly',
    'Weekly Plan',
    8.00,
    0.00,
    '{"food_detection": true, "meal_planning": true, "recipe_generation": true, "priority_support": true}',
    '{"food_detection_per_week": -1, "meal_planning_per_week": -1, "recipe_generation_per_week": -1}',
    7,
    'weekly',
    'USD'
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    duration_days = EXCLUDED.duration_days,
    billing_cycle = EXCLUDED.billing_cycle,
    currency = EXCLUDED.currency,
    updated_at = NOW();

-- Get the weekly plan ID
DO $$
DECLARE
    weekly_plan_id UUID;
    test_users_count INTEGER;
    user_record RECORD;
    subscription_id UUID;
BEGIN
    -- Get the weekly plan ID
    SELECT id INTO weekly_plan_id 
    FROM public.subscription_plans 
    WHERE name = 'weekly';
    
    -- Check how many users we have
    SELECT COUNT(*) INTO test_users_count 
    FROM auth.users;
    
    RAISE NOTICE 'Found % users in the database', test_users_count;
    
    -- Select 3 random users who don't already have an active subscription
    FOR user_record IN 
        SELECT u.id, u.email
        FROM auth.users u
        LEFT JOIN public.user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
        WHERE us.id IS NULL
        ORDER BY RANDOM()
        LIMIT 3
    LOOP
        -- Create a test subscription for this user
        INSERT INTO public.user_subscriptions (
            user_id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            paystack_subscription_id,
            paystack_customer_id,
            metadata,
            created_at,
            updated_at
        ) VALUES (
            user_record.id,
            weekly_plan_id,
            'active',
            NOW(),
            NOW() + INTERVAL '7 days',
            'test_sub_' || user_record.id,
            'test_customer_' || user_record.id,
            '{"test_subscription": true, "created_by": "test_script"}'::jsonb,
            NOW(),
            NOW()
        ) RETURNING id INTO subscription_id;
        
        RAISE NOTICE 'Created test subscription for user % (%) with subscription ID %', 
            user_record.email, user_record.id, subscription_id;
        
        -- Create a test payment transaction
        INSERT INTO public.payment_transactions (
            user_id,
            subscription_id,
            paystack_transaction_id,
            paystack_reference,
            amount,
            currency,
            status,
            payment_method,
            description,
            metadata
        ) VALUES (
            user_record.id,
            subscription_id,
            'test_txn_' || user_record.id,
            'test_ref_' || user_record.id,
            8.00,
            'USD',
            'success',
            'test_card',
            'Test Weekly Plan Subscription',
            '{"test_payment": true, "created_by": "test_script"}'::jsonb
        );
        
        RAISE NOTICE 'Created test payment transaction for user %', user_record.email;
    END LOOP;
    
    RAISE NOTICE 'Test subscription setup completed successfully!';
END $$;

-- Verify the test subscriptions were created
SELECT 
    u.email,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    us.status,
    us.current_period_start,
    us.current_period_end,
    us.paystack_subscription_id,
    pt.amount,
    pt.currency,
    pt.status as payment_status
FROM auth.users u
JOIN public.user_subscriptions us ON u.id = us.user_id
JOIN public.subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN public.payment_transactions pt ON us.id = pt.subscription_id
WHERE us.paystack_subscription_id LIKE 'test_sub_%'
ORDER BY us.created_at DESC;

-- ================================================
-- Summary:
-- ================================================
-- This script will:
-- 1. Ensure the weekly plan exists in subscription_plans
-- 2. Select 3 random users who don't have active subscriptions
-- 3. Create active subscriptions for them with 7-day duration
-- 4. Create corresponding payment transactions
-- 5. Display the results for verification
--
-- The test users will have:
-- - Plan: Weekly Plan
-- - Duration: 7 days from now
-- - Status: Active
-- - Payment: Successfully processed
-- - All premium features unlocked
-- ================================================ 