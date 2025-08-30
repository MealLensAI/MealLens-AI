# Admin Setup

## Quick Setup

1. **Run the SQL script:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste contents of `ADMIN_SETUP.sql`
   - Click **Run**

2. **Login as admin:**
   - Go to `/admin-login`
   - Email: `admin@meallensai.com`
   - Password: `SecureAdmin202#`

3. **Access admin dashboard:**
   - You'll be redirected to `/admin` dashboard
   - Full admin features available

## Admin Features
- User management
- Subscription monitoring
- Analytics and reports
- Export functionality
- Admin settings

## Security
- Admin system is completely separate from user interface
- Only users with `role = 'admin'` can access
- Regular users are redirected to main app