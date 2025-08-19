from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv

load_dotenv()  # This loads the environment variables from .env file
from supabase import create_client, Client

from flask_cors import CORS, cross_origin  # Import CORS

# Import services
from services.auth_service import AuthService
from services.supabase_service import SupabaseService
from database import initialize_database_pool, cleanup_database_pool

# Payment service import
try:
    from services.payment_service import PaymentService

    PAYMENT_ENABLED = True
except ImportError:
    PAYMENT_ENABLED = False
    pass

# Import blueprints for routes
from routes.food_detection_routes import food_detection_bp
from routes.feedback_routes import feedback_bp
from routes.meal_plan_routes import meal_plan_bp
from routes.auth_routes import auth_bp
from routes.ai_session_routes import ai_session_bp
from routes.session_routes import session_bp
from routes.settings_routes import settings_bp
from routes.server_time_routes import server_time_routes
from routes.health_routes import health_bp

# Payment routes import
try:
    from routes.payment_routes import payment_bp

    PAYMENT_ROUTES_ENABLED = True
    print("Payment routes loaded successfully.")
except ImportError as e:
    PAYMENT_ROUTES_ENABLED = False
    print(f"Payment routes not available: {e}")
except SyntaxError as e:
    PAYMENT_ROUTES_ENABLED = False
    print(f"Payment routes have syntax errors: {e}")
    print("Payment endpoints will be disabled.")
except Exception as e:
    PAYMENT_ROUTES_ENABLED = False
    print(f"Payment routes error: {e}")
    print("Payment endpoints will be disabled.")


def create_app():
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)
    
    # Configure CORS to allow requests from the frontend
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173", "https://meallens-ai.vercel.app", "https://meallensai.com", "https://meallens-ai.netlify.app", "https://meallens-ai-cmps.onrender.com"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "expose_headers": ["Content-Type", "Authorization"],
                "max_age": 600  # Cache preflight request for 10 minutes
            }
        },
        supports_credentials=True
    )
    
    # Add CORS headers to all responses for preflight requests
    @app.after_request
    def after_request(response):
        # Only add CORS headers if they're not already set by Flask-CORS
        if 'Access-Control-Allow-Origin' not in response.headers:
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    # Initialize Supabase clients
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_service_role_key:
        raise ValueError("Missing required Supabase credentials in .env file")

    # Initialize database connection pool
    try:
        app.db_pool = initialize_database_pool()
        print("Database connection pool initialized successfully")
    except Exception as e:
        print(f"Failed to initialize database pool: {e}")
        raise

    # Create Supabase client with service role key for admin operations
    app.supabase_service = SupabaseService(supabase_url, supabase_service_role_key)

    # Initialize PaymentService if enabled
    if PAYMENT_ENABLED:
        try:
            # Only initialize if Paystack keys are provided
            paystack_secret = os.environ.get("PAYSTACK_SECRET_KEY")
            if paystack_secret:
                app.payment_service = PaymentService(app.supabase_service.supabase)
                print("Payment service initialized successfully.")
                # Add Paystack connection test/print (non-blocking)
                try:
                    print("[Paystack] PAYSTACK_SECRET_KEY loaded. Testing connection...")
                    import requests
                    headers = {"Authorization": f"Bearer {paystack_secret}"}
                    resp = requests.get("https://api.paystack.co/plan", headers=headers, timeout=3)
                    if resp.status_code == 200:
                        print("[Paystack] Connected to Paystack API successfully!")
                    else:
                        print(f"[Paystack] Could not connect to Paystack API. Status: {resp.status_code}")
                except Exception as e:
                    print(f"[Paystack] Warning: Could not test Paystack connection: {e}")
                    print("[Paystack] Service will continue without payment features.")
            else:
                print("Payment service disabled - PAYSTACK_SECRET_KEY not provided")
                app.payment_service = None
        except Exception as e:
            print(f"Warning: Failed to initialize PaymentService: {str(e)}")
            print("Payment features will be disabled.")
            app.payment_service = None
    else:
        print("Payment service disabled - payment features will be unavailable")
        app.payment_service = None

    # Initialize AuthService with Supabase client only
    try:
        app.auth_service = AuthService(app.supabase_service.supabase)
        print("AuthService initialized successfully.")
    except Exception as e:
        print(f"Warning: Failed to initialize AuthService: {str(e)}")
        print("Authentication features will be disabled.")
        app.auth_service = None

    # Ensure payment_service is set even if initialization failed
    if not hasattr(app, 'payment_service') or app.payment_service is None:
        app.payment_service = None
        print("Payment service not available - payment features will be disabled")

    # Register blueprints with API prefix
    app.register_blueprint(food_detection_bp, url_prefix='/api/food_detection')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(meal_plan_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(ai_session_bp, url_prefix='/api')
    app.register_blueprint(session_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api')
    app.register_blueprint(server_time_routes, url_prefix='/api')
    app.register_blueprint(health_bp)  # Health routes don't need API prefix

    # Register payment routes if enabled
    if PAYMENT_ROUTES_ENABLED:
        app.register_blueprint(payment_bp, url_prefix='/api/payment')
        print("Payment routes registered.")
    else:
        print("Payment routes disabled.")

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)
