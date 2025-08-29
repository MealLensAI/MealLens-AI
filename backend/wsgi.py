#!/usr/bin/env python3
"""
WSGI entry point for production deployment with Gunicorn or uWSGI.
Updated to fix import issues.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the app directly from app.py (fixed import issue)
from app import app

# Create the WSGI application
application = app

if __name__ == "__main__":
    application.run()