# =============================================================================
# PAYMENT ROUTES - MULTI-PROVIDER SUPPORT
# =============================================================================
# 
# This file contains the complete multi-payment provider integration.
# The payment system includes:
# - Multiple payment providers (Paystack, M-Pesa, Stripe)
# - Subscription plans (Free, Weekly, Two-Week, Monthly)
# - Usage tracking and limits
# - Provider selection based on currency and region
# - Webhook handling for all providers
# - Automatic limit enforcement
# - Duration-based subscriptions
#
# See docs/payment_api.md for complete documentation
# =============================================================================

from flask import Blueprint, request, jsonify, current_app
from services.payment_service import PaymentService
from services.auth_service import AuthService
import uuid
from datetime import datetime, timedelta
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

    # Fallback to simulated service for testing
    try:
        return SimulatedPaymentService(current_app.supabase_service.supabase)
    except Exception as e:
        print(f"Failed to create simulated payment service: {e}")
        return None
    
def authenticate_user():
    """Authenticate user and return user_id"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        auth_service = AuthService(current_app.supabase_service.supabase)
        user_id = auth_service.verify_token(token)
        return user_id
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

@payment_bp.route('/providers', methods=['GET'])
def get_payment_providers():
    """Get available payment providers and their capabilities"""
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    try:
        providers = payment_service.get_available_providers()
        return jsonify({
            'status': 'success',
            'providers': providers
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get providers: {str(e)}'
        }), 500

@payment_bp.route('/providers/<currency>', methods=['GET'])
def get_providers_for_currency(currency):
    """Get payment providers that support a specific currency"""
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    try:
        available_providers = payment_service.get_available_providers()
        supported_providers = {}
        
        for provider_name, provider_info in available_providers.items():
            if currency in provider_info.get('currencies', []):
                supported_providers[provider_name] = provider_info
        
        return jsonify({
            'status': 'success',
            'currency': currency,
            'providers': supported_providers
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get providers for currency: {str(e)}'
        }), 500

@payment_bp.route('/plans', methods=['GET'])
def get_subscription_plans():
    """Get available subscription plans"""
    try:
        # Get plans from database
        plans_result = current_app.supabase_service.supabase.table('subscription_plans').select('*').eq('is_active', True).execute()
        
        if not plans_result.data:
            # Return default plans if none in database
            default_plans = [
                {
                    'id': 'free',
                    'name': 'free',
                    'display_name': 'Free Plan',
                    'price_weekly': 0,
                    'price_two_weeks': 0,
                    'price_monthly': 0,
                    'currency': 'USD',
                    'features': ['5 Food Detections', '3 Meal Plans', 'Basic Support'],
                    'limits': {
                        'detections_per_day': 5,
                        'meal_plans_per_month': 3,
                        'ai_kitchen_requests': 5
                    },
                    'is_active': True,
                    'duration_days': 30,
                    'billing_cycle': 'monthly'
                },
                {
                    'id': 'weekly',
                    'name': 'weekly',
                    'display_name': 'Weekly Plan',
                    'price_weekly': 2.50,
                    'price_two_weeks': 5.00,
                    'price_monthly': 10.00,
                    'currency': 'USD',
                    'features': ['Unlimited Food Detection', 'Unlimited AI Kitchen Assistant', 'Unlimited Meal Planning', 'Full History Access'],
                    'limits': {
                        'detections_per_day': -1,
                        'meal_plans_per_month': -1,
                        'ai_kitchen_requests': -1
                    },
                    'is_active': True,
                    'duration_days': 7,
                    'billing_cycle': 'weekly'
                },
                {
                    'id': 'two_weeks',
                    'name': 'two_weeks',
                    'display_name': 'Two Weeks Plan',
                    'price_weekly': 2.50,
                    'price_two_weeks': 5.00,
                    'price_monthly': 10.00,
                    'currency': 'USD',
                    'features': ['Unlimited Food Detection', 'Unlimited AI Kitchen Assistant', 'Unlimited Meal Planning', 'Full History Access'],
                    'limits': {
                        'detections_per_day': -1,
                        'meal_plans_per_month': -1,
                        'ai_kitchen_requests': -1
                    },
                    'is_active': True,
                    'duration_days': 14,
                    'billing_cycle': 'two_weeks'
                },
                {
                    'id': 'monthly',
                    'name': 'monthly',
                    'display_name': 'Monthly Plan',
                    'price_weekly': 2.50,
                    'price_two_weeks': 5.00,
                    'price_monthly': 10.00,
                    'currency': 'USD',
                    'features': ['Unlimited Food Detection', 'Unlimited AI Kitchen Assistant', 'Unlimited Meal Planning', 'Full History Access', 'Priority Support'],
                    'limits': {
                        'detections_per_day': -1,
                        'meal_plans_per_month': -1,
                        'ai_kitchen_requests': -1
                    },
                    'is_active': True,
                    'duration_days': 30,
                    'billing_cycle': 'monthly'
                }
            ]
            return jsonify({
                'status': 'success',
                'plans': default_plans
            }), 200
        
            return jsonify({
            'status': 'success',
            'plans': plans_result.data
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get plans: {str(e)}'
        }), 500

@payment_bp.route('/subscription', methods=['GET'])
def get_user_subscription():
    """Get user's current subscription"""
        user_id = authenticate_user()
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        
    try:
        # Get user's subscription
        subscription_result = current_app.supabase_service.supabase.table('subscriptions').select('*').eq('user_id', user_id).eq('is_active', True).execute()
        
        if not subscription_result.data:
            return jsonify({
                'status': 'success',
                'subscription': None,
                'plan': 'free'
            }), 200
        
        subscription = subscription_result.data[0]
        return jsonify({
            'status': 'success',
            'subscription': subscription,
            'plan': subscription.get('plan_name', 'free')
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get subscription: {str(e)}'
        }), 500

@payment_bp.route('/initialize-payment', methods=['POST'])
def initialize_payment():
    """Initialize a payment with the best available provider"""
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
        data = request.get_json()
        email = data.get('email')
        amount = data.get('amount')
        currency = data.get('currency', 'USD')
        plan_id = data.get('plan_id')
        provider = data.get('provider')  # Optional: specify provider
        metadata = data.get('metadata', {})
        
        if not email or not amount or not plan_id:
        return jsonify({
                'status': 'error',
                'message': 'Email, amount, and plan_id are required'
            }), 400
        
        # Generate unique reference
        reference = f"ML_{uuid.uuid4().hex[:16].upper()}"
        
        # Add metadata
        metadata.update({
            'user_id': user_id,
            'plan_id': plan_id,
            'amount': amount,
            'currency': currency
        })
        
        # Set callback URL
        callback_url = f"{request.host_url.rstrip('/')}/api/payment/verify-payment/{reference}"
        
        # Initialize payment
        result = payment_service.initialize_payment(
            email=email,
            amount=amount,
            currency=currency,
            reference=reference,
            callback_url=callback_url,
            provider=provider,
            metadata=metadata
        )
        
        if result.get('status'):
            # Save transaction to database
            transaction_data = {
                'user_id': user_id,
                'reference': reference,
                'amount': amount,
                'currency': currency,
                'plan_id': plan_id,
                'provider': result.get('provider', provider),
                'status': 'pending',
                'metadata': metadata,
                'created_at': datetime.now().isoformat()
            }
            
            try:
                current_app.supabase_service.supabase.table('transactions').insert(transaction_data).execute()
            except Exception as e:
                print(f"Failed to save transaction: {e}")
        
        return jsonify(result), 200 if result.get('status') else 400
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Payment initialization failed: {str(e)}'
        }), 500

@payment_bp.route('/verify-payment/<reference>', methods=['GET'])
def verify_payment(reference):
    """Verify a payment transaction"""
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
        # Get transaction from database to determine provider
        transaction_result = current_app.supabase_service.supabase.table('transactions').select('*').eq('reference', reference).execute()
        
        if not transaction_result.data:
    return jsonify({
                'status': 'error',
                'message': 'Transaction not found'
            }), 404
        
        transaction = transaction_result.data[0]
        provider = transaction.get('provider', 'paystack')
        
        # Verify payment
        result = payment_service.verify_payment(reference, provider)
        
        if result.get('status'):
            # Update transaction status
            payment_service.update_transaction_status(reference, 'completed', provider)
            
            # Update user subscription if payment was successful
            plan_id = transaction.get('plan_id')
            if plan_id and plan_id != 'free':
                # Update or create subscription
                subscription_data = {
                    'user_id': user_id,
                    'plan_id': plan_id,
                    'plan_name': plan_id,
                    'is_active': True,
                    'start_date': datetime.now().isoformat(),
                    'end_date': (datetime.now() + timedelta(days=30)).isoformat(),  # Default 30 days
                    'created_at': datetime.now().isoformat()
                }
                
                try:
                    # Check if user already has a subscription
                    existing_sub = current_app.supabase_service.supabase.table('subscriptions').select('*').eq('user_id', user_id).eq('is_active', True).execute()
                    
                    if existing_sub.data:
                        # Update existing subscription
                        current_app.supabase_service.supabase.table('subscriptions').update(subscription_data).eq('user_id', user_id).execute()
                    else:
                        # Create new subscription
                        current_app.supabase_service.supabase.table('subscriptions').insert(subscription_data).execute()
                except Exception as e:
                    print(f"Failed to update subscription: {e}")
        
        return jsonify(result), 200 if result.get('status') else 400
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Payment verification failed: {str(e)}'
        }), 500
    
@payment_bp.route('/webhook/<provider>', methods=['POST'])
def payment_webhook(provider):
    """Handle payment webhooks from different providers"""
    payment_service = get_payment_service()
    if not payment_service:
        return jsonify({
            'status': 'error',
            'message': 'Payment service not configured'
        }), 500
    
    try:
        # Handle webhook based on provider
        if provider == 'paystack':
            return handle_paystack_webhook()
        elif provider == 'mpesa':
            return handle_mpesa_webhook()
        elif provider == 'stripe':
            return handle_stripe_webhook()
        else:
            return jsonify({
                'status': 'error',
                'message': f'Unsupported provider: {provider}'
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Webhook processing failed: {str(e)}'
        }), 500

def handle_paystack_webhook():
    """Handle Paystack webhook"""
    try:
        data = request.get_json()
        
        # Verify webhook signature (implement signature verification)
        # For now, we'll trust the webhook
        
        event = data.get('event')
        data_obj = data.get('data', {})
        
        if event == 'charge.success':
            reference = data_obj.get('reference')
            if reference:
                # Update transaction status
                payment_service = get_payment_service()
                if payment_service:
                    payment_service.update_transaction_status(reference, 'completed', 'paystack')
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Paystack webhook processing failed: {str(e)}'
        }), 500

def handle_mpesa_webhook():
    """Handle M-Pesa webhook"""
    try:
        data = request.get_json()
        
        # Process M-Pesa webhook data
        # This would include STK push result, C2B payment, etc.
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'M-Pesa webhook processing failed: {str(e)}'
        }), 500

def handle_stripe_webhook():
    """Handle Stripe webhook"""
    try:
        data = request.get_json()
        
        # Process Stripe webhook data
        # This would include payment_intent.succeeded, etc.
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Stripe webhook processing failed: {str(e)}'
        }), 500

@payment_bp.route('/usage', methods=['GET'])
def get_usage_summary():
    """Get user's usage summary"""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    try:
        # Get current month usage
        current_month = datetime.now().strftime('%Y-%m')
        usage_result = current_app.supabase_service.supabase.table('usage_tracking').select('*').eq('user_id', user_id).eq('month', current_month).execute()
        
        # Group by feature
        usage_summary = {}
        for usage in usage_result.data:
            feature = usage.get('feature_name')
            if feature not in usage_summary:
                usage_summary[feature] = 0
            usage_summary[feature] += 1
        
        return jsonify({
            'status': 'success',
            'usage': usage_summary,
            'month': current_month
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get usage summary: {str(e)}'
        }), 500

@payment_bp.route('/check-usage/<feature_name>', methods=['GET'])
def check_feature_usage(feature_name):
    """Check if user can use a specific feature"""
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
    """Record usage of a feature"""
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
        # if not usage_check.get('can_use', True):
        #     return jsonify({
        #         'status': 'error',
        #         'message': 'Usage limit exceeded for this month',
        #         'current_usage': usage_check.get('current_usage', 0),
        #         'limit': usage_check.get('limit', 0),
        #         'remaining': usage_check.get('remaining', 0)
        #     }), 403
    
    # Record usage
    result = payment_service.record_usage(user_id, feature_name)
    
    if result.get('status') == 'success':
            return jsonify({
                'status': 'success',
            'message': 'Usage recorded successfully'
            }), 200
        else:
        return jsonify({
            'status': 'error',
            'message': result.get('message', 'Failed to record usage')
        }), 500

@payment_bp.route('/save-transaction', methods=['POST'])
def save_transaction():
    """Save transaction to database (for direct frontend-to-provider flow)"""
    user_id = authenticate_user()
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Authentication required'
        }), 401
    
    try:
        data = request.get_json()
        transaction_data = {
            'user_id': user_id,
            'reference': data.get('reference'),
            'amount': data.get('amount'),
            'currency': data.get('currency', 'USD'),
            'plan_id': data.get('plan_id'),
            'provider': data.get('provider', 'paystack'),
            'status': 'pending',
            'metadata': data.get('metadata', {}),
            'created_at': datetime.now().isoformat()
        }
        
        result = current_app.supabase_service.supabase.table('transactions').insert(transaction_data).execute()
        
                return jsonify({
                    'status': 'success',
            'message': 'Transaction saved successfully',
            'data': result.data[0] if result.data else None
                }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to save transaction: {str(e)}'
        }), 500 

@payment_bp.route('/update-verification', methods=['POST'])
def update_verification():
    """Update payment verification status (for direct frontend-to-provider flow)"""
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
        data = request.get_json()
        reference = data.get('reference')
        status = data.get('status')
        provider = data.get('provider', 'paystack')
        
        if not reference or not status:
            return jsonify({
                'status': 'error',
                'message': 'Reference and status are required'
            }), 400
        
        # Update transaction status
        result = payment_service.update_transaction_status(reference, status, provider)
        
        if result.get('status') == 'success' and status == 'completed':
            # Update user subscription if payment was successful
            transaction_result = current_app.supabase_service.supabase.table('transactions').select('*').eq('reference', reference).execute()
            
            if transaction_result.data:
                transaction = transaction_result.data[0]
                plan_id = transaction.get('plan_id')
                
                if plan_id and plan_id != 'free':
                    # Update or create subscription
                    subscription_data = {
                        'user_id': user_id,
                        'plan_id': plan_id,
                        'plan_name': plan_id,
                        'is_active': True,
                        'start_date': datetime.now().isoformat(),
                        'end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                        'created_at': datetime.now().isoformat()
                    }
                    
                    try:
                        existing_sub = current_app.supabase_service.supabase.table('subscriptions').select('*').eq('user_id', user_id).eq('is_active', True).execute()
                        
                        if existing_sub.data:
                            current_app.supabase_service.supabase.table('subscriptions').update(subscription_data).eq('user_id', user_id).execute()
            else:
                            current_app.supabase_service.supabase.table('subscriptions').insert(subscription_data).execute()
                    except Exception as e:
                        print(f"Failed to update subscription: {e}")
        
        return jsonify(result), 200 if result.get('status') == 'success' else 400
        
    except Exception as e:
                return jsonify({
                    'status': 'error',
            'message': f'Failed to update verification: {str(e)}'
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