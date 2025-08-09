#!/usr/bin/env python3
"""
Production-ready Flask application entry point for MealLens AI.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def create_production_app():
    """Create and configure the Flask app for production."""
    app = create_app()
    
    # Production-specific configurations
    app.config.update(
        DEBUG=False,
        TESTING=False,
        SECRET_KEY=os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production'),
        # Security headers
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        # CORS configuration for production
        CORS_ORIGINS=os.environ.get('FRONTEND_URL', 'https://your-domain.com').split(','),
        # Database connection pooling
        SQLALCHEMY_ENGINE_OPTIONS={
            'pool_pre_ping': True,
            'pool_recycle': 300,
        }
    )
    
    return app

# Create the application instance
application = create_production_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"🚀 Starting MealLens AI Backend in Production Mode")
    print(f"📡 Server: http://{host}:{port}")
    print(f"🌍 Environment: {os.environ.get('FLASK_ENV', 'production')}")
    
    application.run(
        host=host,
        port=port,
        debug=False,
        threaded=True
    )