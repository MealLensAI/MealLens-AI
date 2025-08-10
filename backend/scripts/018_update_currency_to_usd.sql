-- Update currency defaults from NGN to USD
-- This migration changes the default currency across all tables

-- 1. Update subscription_plans table currency default
ALTER TABLE public.subscription_plans 
ALTER COLUMN currency SET DEFAULT 'USD';

-- 2. Update payment_transactions table currency default
ALTER TABLE public.payment_transactions 
ALTER COLUMN currency SET DEFAULT 'USD';

-- 3. Add currency column to profiles table if it doesn't exist, with USD default
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- 4. Update existing records to use USD (optional - only if you want to change existing data)
-- UPDATE public.subscription_plans SET currency = 'USD' WHERE currency = 'NGN';
-- UPDATE public.payment_transactions SET currency = 'USD' WHERE currency = 'NGN';
-- UPDATE public.profiles SET currency = 'USD' WHERE currency = 'NGN' OR currency IS NULL;

-- 5. Add comments to document the currency fields
COMMENT ON COLUMN public.subscription_plans.currency IS 'Currency for plan pricing (default: USD)';
COMMENT ON COLUMN public.payment_transactions.currency IS 'Currency for payment transactions (default: USD)';
COMMENT ON COLUMN public.profiles.currency IS 'User preferred currency (default: USD)';

-- 6. Update the handle_new_user function to include currency field
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    has_health_condition,
    health_conditions,
    allergies,
    currency,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    false,
    '{}',
    '{}',
    'USD',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 7. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Ensure RLS policies are in place
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id); 