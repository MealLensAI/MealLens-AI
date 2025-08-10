#!/bin/bash

# MealLensAI Netlify Deployment Script

echo "🚀 Starting MealLensAI deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run tests (optional)
echo "🧪 Running tests..."
npm run test:run

if [ $? -ne 0 ]; then
    echo "⚠️  Tests failed, but continuing with deployment..."
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found after build"
    exit 1
fi

echo "📁 Build output:"
ls -la dist/

echo ""
echo "🎉 Deployment ready!"
echo ""
echo "Next steps:"
echo "1. Push your code to your Git repository"
echo "2. Connect your repository to Netlify"
echo "3. Set the environment variable: VITE_API_URL=https://meallens-ai.onrender.com"
echo "4. Deploy!"
echo ""
echo "For detailed instructions, see NETLIFY_DEPLOYMENT.md"
