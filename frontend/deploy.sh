#!/bin/bash

# MealLens AI Frontend Deployment Script
# This script helps deploy the frontend to Netlify

set -e  # Exit on any error

echo "🚀 Starting MealLens AI Frontend Deployment..."

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

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build the project
echo "🔨 Building the project..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if Netlify CLI is installed
if command -v netlify &> /dev/null; then
    echo "🌐 Netlify CLI found. Deploying to Netlify..."
    
    # Check if user is logged in to Netlify
    if netlify status &> /dev/null; then
        echo "🚀 Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        echo "✅ Deployment completed!"
    else
        echo "⚠️  Not logged in to Netlify. Please run 'netlify login' first."
        echo "📁 Build files are ready in the 'dist' directory."
        echo "🌐 You can manually deploy by dragging the 'dist' folder to Netlify."
    fi
else
    echo "⚠️  Netlify CLI not found."
    echo "📁 Build files are ready in the 'dist' directory."
    echo "🌐 You can manually deploy by dragging the 'dist' folder to Netlify."
    echo "💡 To install Netlify CLI: npm install -g netlify-cli"
fi

echo "🎉 Deployment script completed!"
