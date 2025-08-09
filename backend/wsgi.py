#!/usr/bin/env python3
"""
WSGI entry point for production deployment with Gunicorn or uWSGI.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from production import create_production_app

# Create the WSGI application
application = create_production_app()

if __name__ == "__main__":
    application.run()