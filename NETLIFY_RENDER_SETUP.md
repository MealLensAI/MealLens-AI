# Netlify + Render Deployment Setup

## Current Setup
- **Frontend**: Netlify (React + TypeScript + Vite)
- **Backend**: Render (Flask + Python)
- **Database**: Supabase (PostgreSQL)

## Backend (Render) - Already Deployed ✅

Your backend is already deployed at: `https://meallens-ai.onrender.com`

**Health Check**: `https://meallens-ai.onrender.com/health`

## Frontend (Netlify) - Configuration Required

### 1. Environment Variables in Netlify Dashboard

Go to your Netlify site dashboard and set these environment variables:

```
VITE_API_URL=https://meallens-ai.onrender.com
VITE_APP_NAME=MealLens
VITE_APP_VERSION=1.0.0
```

### 2. Build Settings

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 3. Deploy

1. Push your changes to GitHub
2. Netlify will automatically deploy
3. Check the deployment logs for any errors

## Testing the Connection

After deployment, test these endpoints:

1. **Frontend**: Visit your Netlify URL
2. **API Connection**: Check browser console for API calls
3. **Login**: Try logging in with test credentials

## Troubleshooting

### If API calls fail:

1. **Check Environment Variables**: Ensure `VITE_API_URL` is set in Netlify
2. **Check CORS**: Backend CORS is configured for Netlify domains
3. **Check Backend**: Verify backend is running at Render URL

### Common Issues:

1. **404 Errors**: API calls going to wrong URL
   - Fix: Set `VITE_API_URL` in Netlify environment variables

2. **CORS Errors**: Frontend can't reach backend
   - Fix: Backend CORS includes Netlify domains

3. **Build Failures**: Check Netlify build logs
   - Fix: Ensure all dependencies are in package.json

## Local Development

For local development, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

## Current Status

✅ Backend deployed on Render  
✅ Frontend configured for Netlify  
✅ API endpoints working  
⚠️ Need to set environment variables in Netlify dashboard 