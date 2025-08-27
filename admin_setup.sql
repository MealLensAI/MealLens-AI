-- Clean Admin Setup for Supabase Dashboard
-- Run this in your Supabase SQL Editor

-- 1. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Create new admin user with specific credentials
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'Admin',
  crypt('SecureAdmin202#', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 4. Get the user ID we just created
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'Admin' LIMIT 1;
  
  -- 5. Create profile for the admin user
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Admin',
    'Admin',
    'User',
    'admin',
    now(),
    now()
  );
END $$;

-- 6. Verify admin user was created
SELECT 
  p.id, 
  p.email, 
  p.first_name, 
  p.last_name, 
  p.role, 
  p.created_at 
FROM public.profiles p
WHERE p.role = 'admin'; 