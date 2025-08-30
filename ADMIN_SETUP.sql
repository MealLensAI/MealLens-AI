-- Admin User Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Add role column to profiles table if it doesn't exist
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

-- 4. Create admin user directly in auth.users
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
    'admin@meallensai.com',
    crypt('SecureAdmin202#', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 5. Get the user ID and create profile
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@meallensai.com';
    
    -- Create profile for admin user
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
        'admin@meallensai.com',
        'Admin',
        'User',
        'admin',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        first_name = 'Admin',
        last_name = 'User',
        updated_at = NOW();
    
    RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
END $$;

-- 6. Verify admin user was created
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@meallensai.com';