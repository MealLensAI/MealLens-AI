-- Add health-related fields to the existing profiles table
-- This migration adds fields for medical conditions and food allergies

-- 1. Add health-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_health_condition boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allergies text[] DEFAULT '{}';

-- 2. Add comments to document the new fields
COMMENT ON COLUMN public.profiles.has_health_condition IS 'Boolean flag indicating if user has any medical conditions';
COMMENT ON COLUMN public.profiles.health_conditions IS 'Array of medical conditions (e.g., diabetes, hypertension)';
COMMENT ON COLUMN public.profiles.allergies IS 'Array of food allergies (e.g., peanuts, shellfish)';

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