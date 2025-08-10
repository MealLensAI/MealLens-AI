#!/bin/bash

# Backend Deployment Script for Render
echo "🚀 Deploying MealLens Backend to Render..."

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found in backend directory"
    exit 1
fi

# Check if wsgi.py exists
if [ ! -f "wsgi.py" ]; then
    echo "❌ Error: wsgi.py not found in backend directory"
    exit 1
fi

echo "✅ Backend files verified"
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Render"
echo "3. Set the following environment variables in Render:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - PAYSTACK_SECRET_KEY"
echo "   - PAYSTACK_PUBLIC_KEY"
echo "   - JWT_SECRET"
echo "   - DATABASE_URL"
echo "4. Set build command: pip install -r requirements.txt"
echo "5. Set start command: gunicorn wsgi:app"
echo "6. Set health check path: /health"

echo "🎯 Your backend will be available at: https://your-app-name.onrender.com"
echo "🔗 Health check: https://your-app-name.onrender.com/health" 