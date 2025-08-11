# Deployment Guide for MealLens AI Frontend

This guide will help you deploy the MealLens AI frontend to Netlify and configure it to work with your backend.

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- Netlify account
- Backend API deployed and accessible

## Environment Variables

Before deploying, you need to set up the following environment variables in Netlify:

### Required Environment Variables

1. **Backend API URL**
   ```
   VITE_API_URL=https://meallens-ai.onrender.com
   ```

2. **Firebase Configuration** (if using Firebase)
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Supabase Configuration** (if using Supabase)
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Payment Configuration** (if using Paystack)
   ```
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```

## Deployment Steps

### Option 1: Deploy via Netlify UI (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket repository
   - Select the repository containing this frontend code

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add all the required environment variables listed above
   - Make sure to use your actual backend URL and API keys

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build and Deploy**
   ```bash
   npm run deploy:netlify
   ```

### Option 3: Manual Deployment

1. **Build the project**
   ```bash
   npm run build:prod
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify's deploy area
   - Or use the Netlify CLI: `netlify deploy --prod --dir=dist`

## Configuration Files

The following files are already configured for Netlify deployment:

- `netlify.toml` - Netlify configuration with redirects and headers
- `public/_redirects` - SPA routing redirects
- `vite.config.ts` - Build configuration optimized for production

## Backend Integration

The application is configured to communicate with your backend through:

1. **API Service** (`src/lib/api.ts`)
   - Uses environment variable `VITE_API_URL` for backend communication
   - Falls back to `/api` proxy in development
   - Handles authentication and error management

2. **Direct API Calls**
   - Some components make direct calls to specific endpoints
   - All hardcoded localhost URLs have been updated to production URLs

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your backend has CORS configured to allow requests from your Netlify domain
   - Add your Netlify domain to the allowed origins in your backend

2. **Environment Variables Not Working**
   - Make sure all environment variables are set in Netlify dashboard
   - Redeploy after adding new environment variables
   - Check that variable names start with `VITE_`

3. **Routing Issues**
   - The `netlify.toml` and `_redirects` files handle SPA routing
   - If routes don't work, check that these files are in the correct location

4. **Build Failures**
   - Check that Node.js version is 18+
   - Ensure all dependencies are installed: `npm install`
   - Check build logs in Netlify dashboard

### Backend URL Configuration

If you need to change the backend URL:

1. Update the `VITE_API_URL` environment variable in Netlify
2. Update any hardcoded URLs in the codebase
3. Redeploy the application

## Performance Optimization

The build configuration includes:

- Code splitting for vendor and UI libraries
- Optimized asset caching headers
- Source maps disabled for production
- Manual chunk configuration for better loading performance

## Security Headers

The `netlify.toml` file includes security headers:

- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Support

If you encounter issues during deployment:

1. Check the Netlify build logs
2. Verify all environment variables are set correctly
3. Ensure your backend is accessible from the internet
4. Test the API endpoints directly to ensure they're working
