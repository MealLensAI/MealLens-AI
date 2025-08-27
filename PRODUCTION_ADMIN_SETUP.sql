-- Simple Admin Setup for Supabase Dashboard
-- Run this in your Supabase SQL Editor

-- 1. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Update RLS policies for admin access
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
CREATE POLICY "Admins can view all profiles." ON public.profiles 
FOR SELECT USING (
  role = 'admin' OR auth.uid() = id
);

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile." ON public.profiles 
FOR UPDATE USING (
  role = 'admin' OR auth.uid() = id
);

-- 4. Create admin user (you'll need to sign up normally first, then run this)
-- Replace 'your-email@example.com' with the email you want to make admin
UPDATE public.profiles 
SET role = 'admin', 
    first_name = 'Admin', 
    last_name = 'User',
    updated_at = now()
WHERE email = 'Admin';

-- 5. Verify admin user was created
SELECT id, email, first_name, last_name, role, created_at 
FROM public.profiles 
WHERE role = 'admin'; 