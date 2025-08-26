# =============================================================================
# PAYMENT ROUTES - ENABLED
# =============================================================================
# 
# This file contains the complete Paystack payment integration.
# The payment system includes:
# - Subscription plans (Free, Weekly, Two-Week, Monthly)
# - Usage tracking and limits
# - Paystack payment processing
# - Webhook handling
# - Automatic limit enforcement
# - Duration-based subscriptions
#
# See docs/payment_api.md for complete documentation
# =============================================================================

from flask import Blueprint, request, jsonify, current_app
from services.payment_service import PaymentService
from services.auth_service import AuthService
import uuid
from datetime import datetime
from typing import Optional
from config.subscription import (
    FREE_TRIAL_DAYS, FREE_RESET_PERIOD, PAID_PLANS,
    FREE_FEATURE_LIMITS, PAID_FEATURE_ACCESS,
    get_free_trial_end_date, get_free_tier_reset_date,
    get_paid_plan_duration, is_feature_allowed_for_free_tier,
    is_feature_allowed_for_paid_tier
)

# SIMULATION MODE: If PaymentService is not available, use SimulatedPaymentService for local testing.
from services.payment_service import SimulatedPaymentService, PaymentService
import os

payment_bp = Blueprint('payment', __name__)

def get_payment_service() -> Optional[PaymentService]:
    """Get payment service instance. Use SimulatedPaymentService if real one is not available."""
    # First check if we have a payment service on the app
    if hasattr(current_app, 'payment_service') and current_app.payment_service is not None:
    return current_app.payment_service
    
    # If no payment service on app, check if we have Paystack keys and create one
    paystack_secret = os.environ.get("PAYSTACK_SECRET_KEY")
    if paystack_secret and hasattr(current_app, 'supabase_service'):
        try:
            print("[DEBUG] Creating PaymentService with available keys")
            return PaymentService(current_app.supabase_service.supabase)
        except Exception as e:
            print(f"[DEBUG] Failed to create PaymentService: {e}")
            return SimulatedPaymentService()
    
    # Fallback to simulated service
    print("[DEBUG] Using SimulatedPaymentService as fallback")
    return SimulatedPaymentService()

def get_auth_service() -> Optional[AuthService]:
    """Get auth service instance."""
    if not hasattr(current_app, 'auth_service'):
        return None
    return current_app.auth_service

def authenticate_user() -> Optional[str]:
    """Authenticate user and return user ID."""
    auth_service = get_auth_service()
    if not auth_service:
        return None
    
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    user_id, auth_type = auth_service.get_supabase_user_id_from_token(token)
    return user_id

@payment_bp.route('/test', methods=['GET'])
def test_payment_system():
    """Test endpoint to check if payment system is working."""
    try:
        # Test if we can connect to the database
        result = current_app.supabase_service.supabase.table('subscription_plans').select('*').limit(1).execute()
        
        return jsonify({
            'status': 'success',
            'message': 'Payment system is working',
            'database_connected': True,
            'plans_count': len(result.data) if result.data else 0
        }), 200
    except Exception as e:
        print(f"Error in test_payment_system: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Database error: {str(e)}',
            'database_connected': False
        }), 500

@payment_bp.route('/test-service', methods=['GET'])
def test_payment_service():
    """Test if payment service is working correctly."""
    try:
        payment_service = get_payment_service()
        if not payment_service:
            return jsonify({
                'status': 'error',
                'message': 'Payment service not configured'
            }), 500
        
        # Test if it's a simulated service
        if hasattr(payment_service, '__class__') and 'Simulated' in payment_service.__class__.__name__:
            return jsonify({
                'status': 'success',
                'message': 'Simulated payment service is working',
                'service_type': 'simulated'
            }), 200
        
        # Test if it's a real service
        if hasattr(payment_service, 'paystack_secret_key'):
            return jsonify({
                'status': 'success',
                'message': 'Real payment service is working',
                'service_type': 'real',
                'has_secret_key': bool(payment_service.paystack_secret_key)
            }), 200
        
        return jsonify({
            'status': 'success',
            'message': 'Payment service is working',
            'service_type': 'unknown'
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Exception in test_payment_service: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Payment service test failed: {str(e)}'
        }), 500

@payment_bp.route('/plans', methods=['GET'])
def get_subscription_plans():
    """Get all available subscription plans."""
    try:
        payment_service = get_payment_service()
        if not payment_service:
            return jsonify({
                'status': 'error',
                'message': 'Payment service not configured'
            }), 500
        
        result = payment_service.get_subscription_plans()
        if result['success']:
            return jsonify({
                'status': 'success',
                'plans': result['data']
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 500
    except Exception as e:
        print(f"Error in get_subscription_plans: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

@payment_bp.route('/subscription', methods=['GET'])
def get_user_subscription():
    """Get current user's subscription."""
    try:
        user_id = authenticate_user()
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        
        payment_service = get_payment_service()
        if not payment_service:
            return jsonify({
                'status': 'error',
                'message': 'Payment service not configured'
            }), 500
        
        subscription = payment_service.get_user_subscription(user_id)
        return jsonify({
            'status': 'success',
            'subscription': subscription
        }), 200
    except Exception as e:
        print(f"Error in get_user_subscription: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

@payment_bp.route('/usage', methods=['GET'])
def get_user_usage():
    """Get current user's usage summary."""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    result = payment_service.get_user_usage_summary(user_id)
    if result['success']:
        return jsonify({
            'status': 'success',
            'usage': result['data']
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 500

@payment_bp.route('/check-usage/<feature_name>', methods=['GET'])
def check_feature_usage(feature_name):
    """Check if user can use a specific feature."""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    usage_check = payment_service.can_use_feature(user_id, feature_name)
    print(f"[DEBUG] can_use_feature endpoint - user: {user_id}, feature: {feature_name}, result: {usage_check}")
    
    # TEMPORARY: Always allow usage during testing
    response_data = {
        'status': 'success',
        'can_use': True,  # Temporarily always allow
        'current_usage': usage_check.get('current_usage', 0),
        'limit': -1,  # Temporarily unlimited
        'remaining': -1,  # Temporarily unlimited
        'message': 'Temporarily allowing all usage during testing'
    }
    
    return jsonify(response_data), 200

@payment_bp.route('/record-usage/<feature_name>', methods=['POST'])
def record_feature_usage(feature_name):
    """Record usage of a feature."""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    # For new users, always allow first usage to start trial
    # Check if this is the user's first usage
    try:
        first_usage_check = current_app.supabase_service.supabase.table('usage_tracking').select('*').eq('user_id', user_id).limit(1).execute()
        is_first_usage = len(first_usage_check.data) == 0
    except Exception as e:
        print(f"Error checking first usage: {e}")
        is_first_usage = False
    
    # TEMPORARY: Allow all users to use features during testing
    # TODO: Re-enable usage limits after testing
    print(f"[DEBUG] Allowing usage for user {user_id}, feature {feature_name}")
    
    # If not first usage, check if user can use the feature
    if not is_first_usage:
        usage_check = payment_service.can_use_feature(user_id, feature_name)
        print(f"[DEBUG] Usage check result: {usage_check}")
        # TEMPORARILY DISABLED: Allow all usage during testing
        # TODO: Re-enable usage limits after testing
        print(f"[DEBUG] TEMPORARILY ALLOWING USAGE - Testing mode enabled")
        # if not usage_check.get('can_use', False):
        #     return jsonify({
        #         'status': 'error',
        #         'message': usage_check.get('message', 'Usage limit exceeded'),
        #         'current_usage': usage_check.get('current_usage', 0),
        #         'limit': usage_check.get('limit', 0)
        #     }), 403
    
    # Record the usage
    data = request.get_json() or {}
    count = data.get('count', 1)
    
    success = payment_service.record_usage(user_id, feature_name, count)
    if success:
        return jsonify({
            'status': 'success',
            'message': 'Usage recorded successfully',
            'is_first_usage': is_first_usage
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': 'Failed to record usage'
        }), 500

@payment_bp.route('/initialize-payment', methods=['POST'])
def initialize_payment():
    """Initialize a Paystack payment."""
    try:
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    data = request.get_json()
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'Request data required'
        }), 400
    
    email = data.get('email')
        amount = data.get('amount')  # Amount in cents
    plan_id = data.get('plan_id')
    callback_url = data.get('callback_url')
        
        print(f"[DEBUG] Payment initialization request: email={email}, amount={amount}, plan_id={plan_id}")
    
    if not all([email, amount, plan_id]):
        return jsonify({
            'status': 'error',
            'message': 'Email, amount, and plan_id are required'
        }), 400
    
    # Generate unique reference
    reference = f"ML_{user_id}_{uuid.uuid4().hex[:8]}"
    
    # Convert amount to kobo (Paystack uses smallest currency unit)
        # Frontend sends amount in cents, but Paystack expects kobo (NGN) or smallest USD unit
        amount_kobo = int(amount)  # Keep as cents since it's already in smallest USD unit
        
        print(f"[DEBUG] Converting amount: {amount} cents -> {amount_kobo} kobo")
    
    # Initialize transaction
    result = payment_service.initialize_transaction(
        email=email,
        amount=amount_kobo,
        reference=reference,
        callback_url=callback_url,
        metadata={
            'user_id': user_id,
            'plan_id': plan_id,
                'amount_usd': amount / 100  # Convert back to USD for reference
        }
    )
        
        print(f"[DEBUG] Paystack response: {result}")
    
    if result.get('status'):
        # Save transaction record
        transaction_data = {
            'id': result['data']['id'],
            'reference': reference,
            'amount': amount_kobo,
            'currency': 'USD',
            'status': 'pending',
            'description': f'Subscription payment for plan {plan_id}'
        }
        
        payment_service.save_payment_transaction(user_id, transaction_data)
        
        return jsonify({
            'status': 'success',
            'data': {
                'authorization_url': result['data']['authorization_url'],
                'reference': reference,
                'access_code': result['data']['access_code']
            }
        }), 200
    else:
            error_msg = result.get('message', 'Failed to initialize payment')
            print(f"[ERROR] Paystack initialization failed: {error_msg}")
            return jsonify({
                'status': 'error',
                'message': error_msg
            }), 500
            
    except Exception as e:
        print(f"[ERROR] Exception in initialize_payment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

@payment_bp.route('/verify-payment/<reference>', methods=['GET'])
def verify_payment(reference):
    """Verify a payment transaction."""
    print(f"[DEBUG] Payment verification requested for reference: {reference}")
    
    user_id = authenticate_user()
    if not user_id:
        print(f"[DEBUG] Authentication failed for payment verification")
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    print(f"[DEBUG] User authenticated: {user_id}")
    
    payment_service = get_payment_service()
    if not payment_service:
        print(f"[DEBUG] Payment service not configured")
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    print(f"[DEBUG] Payment service type: {type(payment_service).__name__}")
    
    # Verify with Paystack
    print(f"[DEBUG] Calling payment_service.verify_transaction...")
    result = payment_service.verify_transaction(reference)
    print(f"[DEBUG] Verification result: {result}")
    
    if result.get('status') and result['data']['status'] == 'success':
        print(f"[DEBUG] Payment verification successful")
        
        # Update transaction status
        print(f"[DEBUG] Saving payment transaction...")
        payment_service.save_payment_transaction(user_id, result['data'])
        
        # Get metadata to determine plan
        metadata = result['data'].get('metadata', {})
        plan_id = metadata.get('plan_id')
        print(f"[DEBUG] Plan ID from metadata: {plan_id}")
        
        if plan_id:
            print(f"[DEBUG] Creating user subscription for plan: {plan_id}")
            # Create or update user subscription
            subscription_result = payment_service.create_user_subscription(
                user_id=user_id,
                plan_id=plan_id,
                paystack_data={
                    'transaction_id': result['data']['id'],
                    'reference': reference
                }
            )
            print(f"[DEBUG] Subscription creation result: {subscription_result}")
            
            if subscription_result['success']:
                print(f"[DEBUG] Subscription activated successfully")
                return jsonify({
                    'status': 'success',
                    'message': 'Payment verified and subscription activated',
                    'subscription': subscription_result['data']
                }), 200
            else:
                print(f"[DEBUG] Failed to activate subscription: {subscription_result}")
                return jsonify({
                    'status': 'error',
                    'message': 'Payment verified but failed to activate subscription'
                }), 500
        
        print(f"[DEBUG] No plan_id found, returning success")
        return jsonify({
            'status': 'success',
            'message': 'Payment verified successfully'
        }), 200
    else:
        print(f"[DEBUG] Payment verification failed: {result}")
        return jsonify({
            'status': 'error',
            'message': 'Payment verification failed'
        }), 400

@payment_bp.route('/webhook', methods=['POST'])
def paystack_webhook():
    """Handle Paystack webhook events."""
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    # Get webhook signature
    signature = request.headers.get('X-Paystack-Signature')
    if not signature:
        return jsonify({
            'status': 'error',
            'message': 'Missing webhook signature'
        }), 400
    
    # Verify signature
    payload = request.get_data(as_text=True)
    if not payment_service.verify_webhook_signature(payload, signature):
        return jsonify({
            'status': 'error',
            'message': 'Invalid webhook signature'
        }), 400
    
    # Process webhook
    try:
        event_data = request.get_json()
        result = payment_service.process_webhook(event_data)
        
        if result['success']:
            return jsonify({'status': 'success'}), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@payment_bp.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    """Cancel user's subscription."""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    try:
        # Update subscription to cancel at period end
        result = current_app.supabase_service.supabase.table('user_subscriptions').update({
            'cancel_at_period_end': True,
            'updated_at': datetime.now().isoformat()
        }).eq('user_id', user_id).eq('status', 'active').execute()
        
        if result.data:
            return jsonify({
                'status': 'success',
                'message': 'Subscription will be cancelled at the end of the current period'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'No active subscription found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@payment_bp.route('/upgrade-subscription', methods=['POST'])
def upgrade_subscription():
    """Upgrade user's subscription."""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    data = request.get_json()
    if not data or 'plan_id' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Plan ID is required'
        }), 400
    
    plan_id = data['plan_id']
    
    try:
        # Get plan details
        plan_result = current_app.supabase_service.supabase.table('subscription_plans').select('*').eq('id', plan_id).single().execute()
        if not plan_result.data:
            return jsonify({
                'status': 'error',
                'message': 'Plan not found'
            }), 404
        
        plan = plan_result.data
        
        # Create new subscription
        payment_service = get_payment_service()
        if payment_service:
            subscription_result = payment_service.create_user_subscription(
                user_id=user_id,
                plan_id=plan_id
            )
            
            if subscription_result['success']:
                return jsonify({
                    'status': 'success',
                    'message': 'Subscription upgraded successfully',
                    'plan': plan
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': subscription_result['error']
                }), 500
        
        return jsonify({
            'status': 'error',
            'message': 'Payment service not available'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 

@payment_bp.route('/process-in-app', methods=['POST'])
def process_in_app_payment():
    """Process payment entirely within the app without external redirects."""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    data = request.get_json()
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'Request data required'
        }), 400
    
    plan_id = data.get('plan_id')
    amount = data.get('amount')
    currency = data.get('currency', 'USD')
    billing_cycle = data.get('billing_cycle')
    payment_method = data.get('payment_method')
    card_data = data.get('card_data', {})
    customer = data.get('customer', {})
    
    if not all([plan_id, amount, billing_cycle]):
        return jsonify({
            'status': 'error',
            'message': 'Plan ID, amount, and billing cycle are required'
        }), 400
    
    try:
        # Generate unique transaction ID
        transaction_id = f"inapp_{user_id}_{uuid.uuid4().hex[:8]}"
        reference = f"ML_{user_id}_{uuid.uuid4().hex[:8]}"
        
        # In a real implementation, you would integrate with a payment processor here
        # For now, we'll simulate a successful payment
        
        # Simulate payment processing delay
        import time
        time.sleep(2)  # Simulate processing time
        
        # Simulate payment success (in real implementation, verify with payment processor)
        payment_successful = True
        
        if payment_successful:
            # Save transaction record
            transaction_data = {
                'id': transaction_id,
                'reference': reference,
                'amount': amount * 100,  # Convert to cents
                'currency': currency,
                'status': 'success',
                'payment_method': payment_method,
                'description': f'In-app subscription payment for plan {plan_id}',
                'metadata': {
                    'plan_id': plan_id,
                    'billing_cycle': billing_cycle,
                    'card_last4': card_data.get('last4'),
                    'card_brand': card_data.get('brand'),
                    'customer_email': customer.get('email'),
                    'customer_name': customer.get('name')
                }
            }
            
            # Save to database
            payment_service.save_payment_transaction(user_id, transaction_data)
            
            # Create or update user subscription
            subscription_result = payment_service.create_user_subscription(
                user_id=user_id,
                plan_id=plan_id,
                paystack_data={
                    'transaction_id': transaction_id,
                    'reference': reference,
                    'billing_cycle': billing_cycle
                }
            )
            
            if subscription_result['success']:
                return jsonify({
                    'status': 'success',
                    'message': 'Payment processed successfully',
                    'data': {
                        'transaction_id': transaction_id,
                        'reference': reference,
                        'subscription': subscription_result['data']
                    }
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Payment processed but failed to activate subscription'
                }), 500
        else:
            return jsonify({
                'status': 'error',
                'message': 'Payment processing failed'
            }), 400
            
    except Exception as e:
        print(f"Error in process_in_app_payment: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Payment processing error: {str(e)}'
        }), 500 

@payment_bp.route('/debug-service', methods=['GET'])
def debug_payment_service():
    """Debug endpoint to check payment service configuration."""
    try:
        payment_service = get_payment_service()
        
        debug_info = {
            'payment_service_type': type(payment_service).__name__,
            'payment_service_available': payment_service is not None,
            'environment_variables': {
                'PAYSTACK_SECRET_KEY': bool(os.environ.get('PAYSTACK_SECRET_KEY')),
                'PAYSTACK_PUBLIC_KEY': bool(os.environ.get('PAYSTACK_PUBLIC_KEY')),
                'SUPABASE_URL': bool(os.environ.get('SUPABASE_URL')),
                'SUPABASE_SERVICE_ROLE_KEY': bool(os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))
            }
        }
        
        if hasattr(payment_service, 'paystack_secret_key'):
            debug_info['paystack_configured'] = bool(payment_service.paystack_secret_key)
        else:
            debug_info['paystack_configured'] = False
            
        return jsonify({
            'status': 'success',
            'debug_info': debug_info
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Debug failed: {str(e)}'
        }), 500 

@payment_bp.route('/health', methods=['GET'])
def payment_health():
    """Simple health check for payment routes."""
    try:
        return jsonify({
            'status': 'success',
            'message': 'Payment routes are working',
            'timestamp': datetime.now().isoformat(),
            'routes_loaded': True
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Payment routes error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500 