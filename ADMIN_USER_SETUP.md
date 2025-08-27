# Admin User Setup Guide

## Method 1: Create Admin User via Supabase Dashboard

### Step 1: Sign Up Normally
1. Go to your app and sign up with:
   - **Email**: `Admin`
   - **Password**: `SecureAdmin202#`

### Step 2: Run SQL Script
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste this script:

```sql
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

-- 4. Make the Admin user an admin
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
```

4. Click **Run** to execute the script

### Step 3: Test Admin Access
1. Go to `/admin-login` in your app
2. Login with:
   - **Email**: `Admin`
   - **Password**: `SecureAdmin202#`
3. You should be redirected to `/admin` dashboard

## Method 2: Alternative Admin Credentials

If you want to use a different email, modify the SQL script:

```sql
-- Replace 'Admin' with your preferred email
UPDATE public.profiles 
SET role = 'admin', 
    first_name = 'Admin', 
    last_name = 'User',
    updated_at = now()
WHERE email = 'your-email@example.com';
```

## Admin Login Details

- **URL**: `/admin-login`
- **Email**: `Admin`
- **Password**: `SecureAdmin202#`

## Troubleshooting

### If the user doesn't exist:
1. First sign up normally with the email `Admin`
2. Then run the SQL script to make them admin

### If you get permission errors:
1. Make sure you're running the script in Supabase SQL Editor
2. Check that RLS policies are properly set up
3. Verify the user exists in both `auth.users` and `public.profiles`

### If admin login doesn't work:
1. Check that the user has `role = 'admin'` in the profiles table
2. Verify the email matches exactly (case-sensitive)
3. Make sure the password is correct 