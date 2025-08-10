#!/bin/bash

# Frontend Deployment Script for Vercel
echo "🚀 Deploying MealLens Frontend to Vercel..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

# Check if vite.config.ts exists
if [ ! -f "vite.config.ts" ]; then
    echo "❌ Error: vite.config.ts not found in frontend directory"
    exit 1
fi

echo "✅ Frontend files verified"
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Vercel"
echo "3. Set the following environment variables in Vercel:"
echo "   - VITE_API_URL=https://your-backend-app.onrender.com"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_PAYSTACK_PUBLIC_KEY"
echo "4. Set root directory to: frontend"
echo "5. Set build command to: npm run build"
echo "6. Set output directory to: dist"

echo "🎯 Your frontend will be available at: https://your-app-name.vercel.app"
echo "🔗 API will be proxied from: https://your-backend-app.onrender.com" 