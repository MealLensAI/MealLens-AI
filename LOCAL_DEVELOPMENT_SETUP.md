# 🛠️ Local Development Setup Guide

## 🚨 **Current Issue: Environment Variables Not Set**

The admin panel is showing 500 errors because the required environment variables are not configured in your local development environment.

## 🔧 **Quick Fix for Local Development**

### **Step 1: Create Environment File**

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env
```

### **Step 2: Add Required Environment Variables**

Add these variables to your `backend/.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# CORS Origins (for local development)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Paystack Configuration (optional for local testing)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### **Step 3: Load Environment Variables**

Install python-dotenv if not already installed:

```bash
cd backend
source venv/bin/activate
pip install python-dotenv
```

### **Step 4: Update Backend to Load .env File**

The backend should automatically load the `.env` file. If not, you can manually load it:

```bash
# In your terminal, before running the backend:
export $(cat backend/.env | xargs)
cd backend
source venv/bin/activate
python app.py
```

## 🎯 **Alternative: Use Production Environment**

If you want to test with the production database, you can use the production environment variables:

```bash
# Set production environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
export JWT_SECRET=your_jwt_secret
export CORS_ORIGINS=http://localhost:5173

# Run backend
cd backend
source venv/bin/activate
python app.py
```

## 🔍 **Verify Setup**

After setting up the environment variables, test the admin endpoints:

```bash
# Test admin routes
curl http://localhost:5000/api/admin/test

# Test admin users (should work now)
curl http://localhost:5000/api/admin/users?limit=1
```

## 📋 **Environment Variables Reference**

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key for admin operations |
| `SUPABASE_ANON_KEY` | ✅ | Anonymous key for client operations |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `CORS_ORIGINS` | ✅ | Allowed CORS origins |
| `PAYSTACK_SECRET_KEY` | ⚠️ | Required for payment features |
| `PAYSTACK_PUBLIC_KEY` | ⚠️ | Required for payment features |

## 🚀 **Quick Start Commands**

```bash
# 1. Set environment variables
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
export JWT_SECRET=your_secret

# 2. Start backend
cd backend
source venv/bin/activate
python app.py

# 3. Start frontend (in another terminal)
cd frontend
npm run dev
```

## 🎯 **Admin Panel Access**

Once environment variables are set:

1. **Admin Login**: `http://localhost:5173/admin-login`
2. **Admin Dashboard**: `http://localhost:5173/admin`
3. **Credentials**: 
   - Email: `admin@meallensai.com`
   - Password: `SecureAdmin202#`

## 🔧 **Troubleshooting**

### **Error: "Database not configured"**
- ✅ Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- ✅ Verify the values are correct (no extra spaces)

### **Error: "Authentication service not configured"**
- ✅ Check that `JWT_SECRET` is set
- ✅ Restart the backend server after setting variables

### **Error: "CORS error"**
- ✅ Add your frontend URL to `CORS_ORIGINS`
- ✅ Include both `http://localhost:5173` and `http://localhost:5174`

## 📞 **Need Help?**

If you're still having issues:

1. Check the backend logs for specific error messages
2. Verify your Supabase project is active
3. Ensure the service role key has the correct permissions
4. Test the database connection manually

**The admin panel will work perfectly once the environment variables are configured!** 🎯