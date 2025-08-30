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
from datetime import datetime, timedelta
import os
import hashlib
import hmac

payment_bp = Blueprint('payment', __name__)

def get_payment_service() -> PaymentService:
    """Get payment service instance"""
    return current_app.payment_service

def authenticate_user():
    """Authenticate user and return user_id"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        auth_service = AuthService(current_app.supabase_service.supabase)
        user_id, auth_type = auth_service.get_supabase_user_id_from_token(token)
        return user_id
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

def verify_paystack_signature(payload, signature):
    """Verify Paystack webhook signature"""
    try:
        secret_key = os.getenv('PAYSTACK_SECRET_KEY')
        if not secret_key:
            return False
        
        # Create HMAC SHA512 hash
        hash = hmac.new(
            secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        return hmac.compare_digest(hash, signature)
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False

@payment_bp.route('/webhook', methods=['POST'])
def paystack_webhook():
    """Handle Paystack webhook events"""
    try:
        # Get the raw payload
        payload = request.get_data()
        signature = request.headers.get('X-Paystack-Signature')
        
        # Verify webhook signature
        if not verify_paystack_signature(payload, signature):
            print("❌ Invalid webhook signature")
            return jsonify({'error': 'Invalid signature'}), 401
        
        # Parse the webhook data
        webhook_data = request.get_json()
        event = webhook_data.get('event')
        data = webhook_data.get('data', {})
        
        print(f"📦 Received webhook event: {event}")
        
        # Get payment service
        payment_service = get_payment_service()
        
        if event == 'charge.success':
            # Payment was successful
            reference = data.get('reference')
            amount = data.get('amount')
            currency = data.get('currency')
            metadata = data.get('metadata', {})
            
            print(f"💰 Payment successful: {reference}")
            
            # Update database with successful payment
            result = payment_service.handle_successful_payment(
                reference=reference,
                amount=amount,
                currency=currency,
                metadata=metadata
            )
            
            if result.get('status'):
                print(f"✅ Database updated for payment: {reference}")
                return jsonify({'status': 'success'}), 200
            else:
                print(f"❌ Database update failed for payment: {reference}")
                return jsonify({'error': 'Database update failed'}), 500
                
        elif event == 'subscription.create':
            # Subscription was created
            subscription_code = data.get('subscription_code')
            customer_email = data.get('customer', {}).get('email')
            
            print(f"📅 Subscription created: {subscription_code}")
            
            # Update database with subscription
            result = payment_service.handle_subscription_created(
                subscription_code=subscription_code,
                customer_email=customer_email,
                metadata=data.get('metadata', {})
            )
            
            return jsonify({'status': 'success'}), 200
            
        elif event == 'subscription.disable':
            # Subscription was disabled/cancelled
            subscription_code = data.get('subscription_code')
            
            print(f"❌ Subscription disabled: {subscription_code}")
            
            # Update database with subscription cancellation
            result = payment_service.handle_subscription_disabled(
                subscription_code=subscription_code
            )
            
            return jsonify({'status': 'success'}), 200
        
        else:
            print(f"⚠️  Unhandled webhook event: {event}")
            return jsonify({'status': 'ignored'}), 200
            
    except Exception as e:
        print(f"❌ Webhook processing error: {e}")
        return jsonify({'error': 'Webhook processing failed'}), 500

@payment_bp.route('/initialize-payment', methods=['POST'])
def initialize_payment():
    """Initialize a payment with Paystack"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        amount = data.get('amount')
        currency = data.get('currency', 'USD')
        plan_id = data.get('plan_id')
        provider = data.get('provider', 'paystack')
        metadata = data.get('metadata', {})

        if not email or not amount or not plan_id:
            return jsonify({'error': 'Missing required fields'}), 400

        # Get user ID from authentication
        user_id = authenticate_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Initialize payment
        payment_service = get_payment_service()
        result = payment_service.initialize_payment(
            email=email,
            amount=amount,
            currency=currency,
            plan_id=plan_id,
            user_id=user_id,
            metadata=metadata
        )
        
        if result.get('status'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        print(f"Payment initialization error: {e}")
        return jsonify({'error': 'Payment initialization failed'}), 500

@payment_bp.route('/verify-payment/<reference>', methods=['GET'])
def verify_payment(reference):
    """Verify a payment with Paystack"""
    try:
        if not reference:
            return jsonify({'error': 'Payment reference required'}), 400

        # Get user ID from authentication
        user_id = authenticate_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify payment
        payment_service = get_payment_service()
        result = payment_service.verify_payment(reference)
        
        if result.get('status'):
            # Update database with successful payment
            payment_service.handle_successful_payment(
                reference=reference,
                amount=result.get('data', {}).get('amount'),
                currency=result.get('data', {}).get('currency'),
                metadata={'user_id': user_id}
            )
            
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        print(f"Payment verification error: {e}")
        return jsonify({'error': 'Payment verification failed'}), 500

@payment_bp.route('/record-usage/<feature_name>', methods=['POST'])
def record_usage(feature_name):
    """Record feature usage for a user"""
    try:
        # Get user ID from authentication
        user_id = authenticate_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Record usage
        payment_service = get_payment_service()
        result = payment_service.record_usage(user_id, feature_name)
        
        return jsonify(result), 200

    except Exception as e:
        print(f"Usage recording error: {e}")
        return jsonify({'error': 'Usage recording failed'}), 500

@payment_bp.route('/subscription-status', methods=['GET'])
def get_subscription_status():
    """Get user's subscription status"""
    try:
        # Get user ID from authentication
        user_id = authenticate_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get subscription status
        payment_service = get_payment_service()
        result = payment_service.get_subscription_status(user_id)
        
        return jsonify(result), 200

    except Exception as e:
        print(f"Subscription status error: {e}")
        return jsonify({'error': 'Failed to get subscription status'}), 500

@payment_bp.route('/can-use-feature/<feature_name>', methods=['GET'])
def can_use_feature(feature_name):
    """Check if user can use a specific feature"""
    try:
        # Get user ID from authentication
        user_id = authenticate_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check feature usage
        payment_service = get_payment_service()
        result = payment_service.can_use_feature(user_id, feature_name)
        
        return jsonify(result), 200

    except Exception as e:
        print(f"Feature check error: {e}")
        return jsonify({'error': 'Failed to check feature usage'}), 500 