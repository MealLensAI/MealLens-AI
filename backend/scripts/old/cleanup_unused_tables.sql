-- ================================================
-- Database Cleanup Script - Remove Unused Tables
-- ================================================

-- WARNING: This script will permanently delete tables and their data
-- Make sure to backup your database before running this script

-- Tables to KEEP (essential for the application):
-- 1. detection_history - Used for food detection history
-- 2. feedback - Used for user feedback
-- 3. payment_transactions - Used for payment processing
-- 4. paystack_webhooks - Used for payment webhooks
-- 5. profiles - Used for user profiles
-- 6. shared_recipes - Used for recipe sharing
-- 7. subscription_plans - Used for subscription management
-- 8. usage_tracking - Used for usage monitoring
-- 9. user_subscriptions - Used for subscription management

-- Tables to REMOVE (not used in the current application):

-- 1. Drop meal_plan_management table (replaced by meal_plans)
-- This table appears to be unused and may have been replaced by a different meal planning system
DROP TABLE IF EXISTS public.meal_plan_management CASCADE;

-- 2. Drop sessions table (not used in current authentication system)
-- The application uses Supabase auth which handles sessions differently
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Verify the cleanup by listing remaining tables
-- You can run this query to see what tables remain:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- ================================================
-- Summary of remaining tables:
-- ================================================
-- 
-- Essential tables that remain:
-- - detection_history: Food detection history and results
-- - feedback: User feedback and reviews
-- - payment_transactions: Payment processing records
-- - paystack_webhooks: Payment webhook events
-- - profiles: User profile information
-- - shared_recipes: Publicly shared recipes
-- - subscription_plans: Available subscription plans
-- - usage_tracking: Feature usage monitoring
-- - user_subscriptions: User subscription records
--
-- ================================================ 