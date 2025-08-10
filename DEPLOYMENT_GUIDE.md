# 🚀 MealLens Deployment Guide

This guide will help you deploy your MealLens application to Render (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub repository with your code
- Render account (for backend)
- Vercel account (for frontend)
- Supabase project configured
- Paystack account (for payments)

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend
1. Ensure your backend directory contains:
   - `app.py` - Main Flask application
   - `wsgi.py` - WSGI entry point
   - `requirements.txt` - Python dependencies
   - `render.yaml` - Render configuration

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `meallens-backend`
   - **Root Directory**: Leave empty (uses root)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`

### Step 3: Environment Variables
Set these environment variables in Render:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
CORS_ORIGINS=https://your-frontend-app.vercel.app,http://localhost:5173
```

### Step 4: Health Check
- **Health Check Path**: `/health`
- **Auto-Deploy**: Enabled

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Ensure your frontend directory contains:
   - `package.json` - Node.js dependencies
   - `vite.config.ts` - Vite configuration
   - `vercel.json` - Vercel configuration

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Environment Variables
Set these environment variables in Vercel:

```bash
VITE_API_URL=https://meallens-ai.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

### Step 4: Domain Configuration
- Vercel will provide a `.vercel.app` domain
- You can add a custom domain later

## 🔗 API Proxy Configuration

The `vercel.json` file includes API proxying to route `/api/*` requests to your Render backend:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://meallens-ai.onrender.com/api/$1"
    }
  ]
}
```

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-app.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "service": "MealLens Backend API",
  "version": "1.0.0"
}
```

### Frontend Test
1. Visit your Vercel URL
2. Check browser console for any errors
3. Test authentication flow
4. Test payment flow

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:
- **Render**: Deploys on every push to main branch
- **Vercel**: Deploys on every push to main branch

## 🚨 Troubleshooting

### Backend Issues
1. **Build Failures**: Check `requirements.txt` and Python version
2. **Runtime Errors**: Check logs in Render dashboard
3. **Database Connection**: Verify Supabase credentials
4. **CORS Errors**: Check `CORS_ORIGINS` environment variable

### Frontend Issues
1. **Build Failures**: Check `package.json` and Node.js version
2. **API Errors**: Verify `VITE_API_URL` points to correct backend
3. **Environment Variables**: Ensure all VITE_* variables are set
4. **CORS Issues**: Check backend CORS configuration

### Common Solutions
1. **Clear Cache**: Redeploy with cache cleared
2. **Check Logs**: Monitor deployment logs for errors
3. **Environment Variables**: Double-check all required variables
4. **Database Migrations**: Run migrations if needed

## 📊 Monitoring

### Backend Monitoring (Render)
- View logs in Render dashboard
- Monitor health check endpoint
- Set up alerts for downtime

### Frontend Monitoring (Vercel)
- View analytics in Vercel dashboard
- Monitor Core Web Vitals
- Set up error tracking

## 🔐 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Configure allowed origins properly
3. **HTTPS**: Both platforms provide SSL certificates
4. **API Keys**: Rotate keys regularly

## 📈 Scaling

### Backend (Render)
- Upgrade to paid plan for better performance
- Configure auto-scaling based on traffic
- Use Redis for session storage

### Frontend (Vercel)
- Vercel automatically scales
- Use CDN for static assets
- Optimize bundle size

## 🎯 Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://meallens-ai.onrender.com`
- **Health Check**: `https://meallens-ai.onrender.com/health`

## 📞 Support

- **Render Support**: [Render Documentation](https://render.com/docs)
- **Vercel Support**: [Vercel Documentation](https://vercel.com/docs)
- **Supabase Support**: [Supabase Documentation](https://supabase.com/docs) 