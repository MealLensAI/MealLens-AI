import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import blueprints
from routes.food_detection_routes import food_detection_bp
from routes.feedback_routes import feedback_bp
from routes.meal_plan_routes import meal_plan_bp
from routes.auth_routes import auth_bp
from routes.ai_session_routes import ai_session_bp
from routes.session_routes import session_bp
from routes.settings_routes import settings_bp
from routes.health_routes import health_bp
from routes.server_time_routes import server_time_routes
from routes.admin_routes import admin_bp
from routes.public_routes import public_bp

# Import services
from services.supabase_service import SupabaseService
from services.payment_service import PaymentService
from services.auth_service import AuthService

# Import database
from database import DatabaseConnectionPool

app = Flask(__name__)

# Configure CORS for production
cors_origins = os.environ.get('CORS_ORIGINS', 'https://meallensai.com,https://www.meallensai.com,http://localhost:3000,http://localhost:5173').split(',')
logger.info(f"CORS origins configured: {cors_origins}")
CORS(app, origins=cors_origins, supports_credentials=True)

# Load payment routes conditionally
try:
    from routes.payment_routes import payment_bp
    payment_routes_available = True
    logger.info("Payment routes loaded successfully.")
except ImportError as e:
    logger.warning(f"Payment routes not available: {e}")
    payment_routes_available = False
except SyntaxError as e:
    logger.error(f"Payment routes have syntax errors: {e}")
    logger.error("Payment endpoints will be disabled.")
    payment_routes_available = False
except Exception as e:
    logger.error(f"Payment routes error: {e}")
    logger.error("Payment endpoints will be disabled.")
    payment_routes_available = False

# Initialize services
def initialize_services():
    """Initialize all services before first request"""
    try:
        # Initialize database connection pool
        app.database_pool = DatabaseConnectionPool()
        logger.info("Database connection pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {e}")
        app.database_pool = None

    # Initialize Supabase service
    try:
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if supabase_url and supabase_key:
            app.supabase_service = SupabaseService(supabase_url, supabase_key)
            logger.info("Supabase service initialized successfully")
        else:
            logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found - Supabase service will be disabled")
            app.supabase_service = None
    except Exception as e:
        logger.error(f"Failed to initialize Supabase service: {e}")
        app.supabase_service = None

    # Initialize payment service
    try:
        paystack_secret_key = os.environ.get('PAYSTACK_SECRET_KEY')
        
        if paystack_secret_key and app.supabase_service:
            logger.info("Initializing Paystack payment service...")
            app.payment_service = PaymentService(app.supabase_service.supabase)
            logger.info("Payment service initialized successfully")
        else:
            logger.warning("PAYSTACK_SECRET_KEY not found or Supabase service not available - payment features will be disabled")
            app.payment_service = None
                
    except Exception as e:
        logger.error(f"Failed to initialize PaymentService: {str(e)}")
        logger.error("Payment features will be disabled.")
        app.payment_service = None

    # Initialize auth service
    try:
        if app.supabase_service:
            app.auth_service = AuthService(app.supabase_service.supabase)
            logger.info("AuthService initialized successfully.")
        else:
            logger.warning("Supabase service not available - AuthService will be disabled")
            app.auth_service = None
    except Exception as e:
        logger.error(f"Failed to initialize AuthService: {str(e)}")
        logger.error("Authentication features will be disabled.")
        app.auth_service = None

# Register blueprints
app.register_blueprint(food_detection_bp, url_prefix='/api/food_detection')
app.register_blueprint(feedback_bp, url_prefix='/api')
app.register_blueprint(meal_plan_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(ai_session_bp, url_prefix='/api')
app.register_blueprint(session_bp, url_prefix='/api')
app.register_blueprint(settings_bp, url_prefix='/api')
app.register_blueprint(server_time_routes, url_prefix='/api')
app.register_blueprint(health_bp)  # Health routes don't need API prefix
app.register_blueprint(admin_bp, url_prefix='/api/admin')  # Admin routes
app.register_blueprint(public_bp, url_prefix='/api/public')  # Public routes

# Register payment routes if available
if payment_routes_available:
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    logger.info("Payment routes registered.")
else:
    logger.warning("Payment routes disabled.")

# Initialize all services
initialize_services()

# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    """Global exception handler for production"""
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Return user-friendly error message
    return jsonify({
        'status': 'error',
        'message': 'An unexpected error occurred. Please try again later.',
        'error_type': 'internal_error'
    }), 500

# Request logging middleware
@app.before_request
def log_request():
    """Log incoming requests for debugging"""
    if app.debug:
        logger.info(f"{request.method} {request.path} - {request.remote_addr}")

@app.before_request
def ensure_services():
    """Ensure all services are initialized for each request"""
    if not hasattr(app, 'supabase_service') or app.supabase_service is None:
        try:
            supabase_url = os.environ.get('SUPABASE_URL')
            supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
            
            if supabase_url and supabase_key:
                app.supabase_service = SupabaseService(supabase_url, supabase_key)
                logger.info("Supabase service initialized in request context")
            else:
                logger.warning("Missing Supabase environment variables in request context")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase service in request context: {e}")
    
    if not hasattr(app, 'auth_service') or app.auth_service is None:
        try:
            if app.supabase_service:
                app.auth_service = AuthService(app.supabase_service.supabase)
                logger.info("Auth service initialized in request context")
            else:
                logger.warning("Supabase service not available for Auth service initialization")
        except Exception as e:
            logger.error(f"Failed to initialize Auth service in request context: {e}")

@app.after_request
def log_response(response):
    """Log response status for debugging"""
    if app.debug:
        logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
    return response

if __name__ == '__main__':
    # Initialize services before running
    with app.app_context():
        initialize_services()
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
