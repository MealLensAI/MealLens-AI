# Admin Setup Guide

## Quick Setup

### 1. Run SQL Script in Supabase Dashboard

Copy and paste this script into your Supabase SQL Editor:

```sql
-- Clean Admin Setup for Supabase Dashboard
-- Run this in your Supabase SQL Editor

-- 1. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Set up admin user (replace with your email)
UPDATE public.profiles 
SET role = 'admin', 
    first_name = 'Admin', 
    last_name = 'User',
    updated_at = now()
WHERE email = 'admin@meallensai.com';

-- 4. Verify admin user
SELECT id, email, first_name, last_name, role, created_at 
FROM public.profiles 
WHERE role = 'admin';
```

### 2. Access Admin Panel

1. Go to `/admin-login` in your app
2. Login with your admin email and password
3. You'll be redirected to `/admin` dashboard

### 3. Admin Features

- **Overview**: Key metrics and quick actions
- **Users**: Manage user accounts
- **Subscriptions**: Monitor subscription status
- **Analytics**: View usage statistics
- **Reports**: Generate reports
- **Settings**: Admin configuration

## Security Notes

- Admin panel is completely separate from user interface
- Only users with `role = 'admin'` can access admin features
- Regular users are redirected to main app if they try to access admin routes
- Admin login uses the same authentication system but with role-based access control

## File Structure

```
frontend/src/
├── pages/
│   ├── AdminLoginPage.tsx    # Separate admin login
│   └── AdminDashboard.tsx    # Admin dashboard wrapper
├── components/
│   ├── AdminLayout.tsx       # Admin-specific layout
│   ├── AdminRoute.tsx        # Protected admin routes
│   └── admin/                # Admin components
└── lib/
    └── api.ts               # Admin API endpoints
``` 