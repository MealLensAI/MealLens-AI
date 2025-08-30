# Backend Scripts

## Available Scripts

### Database Setup
- `setup_missing_tables.sql` - Creates required database tables
- `setup_payment_tables.py` - Sets up payment-related tables
- `verify_database_tables.py` - Verifies all tables exist and are configured
- `create_user_count_function.sql` - Creates user count function

### Admin Setup
- `create_admin_user.sql` - Creates admin user for admin panel access

## Usage

### Create Admin User
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste contents of `create_admin_user.sql`
3. Click **Run**
4. Login at `/admin-login` with:
   - Email: `admin@meallensai.com`
   - Password: `SecureAdmin202#`

### Setup Database Tables
1. Run `setup_missing_tables.sql` in Supabase SQL Editor
2. Run `setup_payment_tables.py` if payment system is needed
3. Run `verify_database_tables.py` to verify setup

## Notes
- All scripts are production-ready
- No simulation or test code included
- Clean, minimal setup process