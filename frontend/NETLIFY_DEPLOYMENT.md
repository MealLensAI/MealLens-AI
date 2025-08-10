# Netlify Deployment Guide for MealLensAI

This guide will help you deploy your MealLensAI React application to Netlify.

## Prerequisites

- A Netlify account
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Connect to Git Repository

1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose your Git provider and select your repository
4. Select the branch you want to deploy (usually `main` or `master`)

### 2. Build Settings

Netlify will automatically detect that this is a Vite project and use these settings:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: 18 (configured in `netlify.toml`)

### 3. Environment Variables

Set these environment variables in Netlify's site settings:

#### Required Environment Variables

```
VITE_API_URL=https://meallens-ai.onrender.com
```

#### Optional Environment Variables (if you want to override defaults)

```
# Firebase Configuration (if you want to use environment variables instead of hardcoded values)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Configuration (Paystack)
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# External AI Services
VITE_AI_SERVICE_URL=https://ai-utu2.onrender.com
VITE_IMAGE_SERVICE_URL=https://get-images-qa23.onrender.com
```

### 4. Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your site
3. You'll get a unique URL (e.g., `https://your-site-name.netlify.app`)

### 5. Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify

## Configuration Files

### netlify.toml
This file configures:
- Build settings
- SPA routing redirects
- Security headers
- Caching rules

### public/_redirects
This file handles client-side routing for React Router.

## Troubleshooting

### Build Failures

1. **Node.js version issues**: Ensure you're using Node.js 18+ (configured in `netlify.toml`)
2. **Missing dependencies**: Run `npm install` locally to ensure all dependencies are in `package.json`
3. **Build errors**: Check the build logs in Netlify for specific error messages

### Runtime Issues

1. **API calls failing**: Ensure `VITE_API_URL` is set correctly
2. **Firebase issues**: Check that Firebase configuration is correct
3. **Routing issues**: The `_redirects` file should handle SPA routing

### Performance Optimization

The `netlify.toml` file includes:
- Static asset caching (1 year for `/assets/*`)
- Security headers
- Proper SPA routing

## Local Development

To test the build locally:

```bash
npm run build
npm run preview
```

This will build the project and serve it locally, similar to how it will run on Netlify.

## Continuous Deployment

Once connected to your Git repository, Netlify will automatically:
- Deploy when you push to your main branch
- Create preview deployments for pull requests
- Roll back to previous deployments if needed

## Support

If you encounter issues:
1. Check the Netlify build logs
2. Verify environment variables are set correctly
3. Test the build locally with `npm run build`
4. Check the Netlify documentation: https://docs.netlify.com
