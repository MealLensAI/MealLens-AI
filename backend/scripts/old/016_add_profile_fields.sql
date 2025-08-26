-- Add missing fields to profiles table
-- This migration adds fields that are being used by the frontend but missing from the database

-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NGN',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS medical_history TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_sickness BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sickness_type TEXT DEFAULT '';

-- 2. Add comments to document the new fields
COMMENT ON COLUMN public.profiles.currency IS 'User''s preferred currency (e.g., NGN, USD, EUR)';
COMMENT ON COLUMN public.profiles.country IS 'User''s country of residence';
COMMENT ON COLUMN public.profiles.state IS 'User''s state/province of residence';
COMMENT ON COLUMN public.profiles.city IS 'User''s city of residence';
COMMENT ON COLUMN public.profiles.address IS 'User''s street address';
COMMENT ON COLUMN public.profiles.postal_code IS 'User''s postal/zip code';
COMMENT ON COLUMN public.profiles.payment_methods IS 'Array of payment method objects';
COMMENT ON COLUMN public.profiles.dietary_preferences IS 'Array of dietary preferences (e.g., vegetarian, vegan)';
COMMENT ON COLUMN public.profiles.medical_history IS 'Array of medical history items';
COMMENT ON COLUMN public.profiles.emergency_contact IS 'Emergency contact information as JSON object';
COMMENT ON COLUMN public.profiles.has_sickness IS 'Boolean flag indicating if user has sickness';
COMMENT ON COLUMN public.profiles.sickness_type IS 'Type of sickness if user has sickness';

-- 3. Update the handle_new_user function to include the new fields
-- First, check if the function exists and drop it if it does
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the updated function
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
    country,
    state,
    city,
    address,
    postal_code,
    payment_methods,
    dietary_preferences,
    medical_history,
    emergency_contact,
    has_sickness,
    sickness_type,
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
    'NGN',
    '',
    '',
    '',
    '',
    '',
    '[]',
    '{}',
    '{}',
    '{}',
    false,
    '',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4. Create trigger to call function after user is created (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Ensure RLS policies are in place for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id); 