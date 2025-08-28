import os
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional

class PaymentService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.paystack_secret_key = os.getenv('PAYSTACK_SECRET_KEY')
        self.paystack_public_key = os.getenv('PAYSTACK_PUBLIC_KEY')
        
        if not self.paystack_secret_key:
            print("[PaymentService] PAYSTACK_SECRET_KEY not found in environment variables")
        else:
            print("[PaymentService] Paystack provider initialized")
        
        print("Payment service initialized successfully.")

    def initialize_payment(self, email: str, amount: float, currency: str = 'USD', 
                          plan_id: str = None, user_id: str = None, metadata: Dict = None) -> Dict:
        """Initialize a payment with Paystack"""
        try:
            if not self.paystack_secret_key:
                return {
                    'status': False,
                    'message': 'Paystack not configured'
                }

            # Convert amount to kobo (Paystack uses kobo for NGN)
            amount_in_kobo = int(amount * 100) if currency == 'NGN' else int(amount * 100)

            # Prepare payment data
            payment_data = {
                'email': email,
                'amount': amount_in_kobo,
                'currency': currency,
                'callback_url': f"{os.getenv('FRONTEND_URL', 'https://meallensai.com')}/payment/success",
                'metadata': {
                    'user_id': user_id,
                    'plan_id': plan_id,
                    **(metadata or {})
                }
            }

            # Make request to Paystack
            try:
                headers = {
                    'Authorization': f'Bearer {self.paystack_secret_key}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.post(
                'https://api.paystack.co/transaction/initialize',
                json=payment_data,
                headers=headers
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('status'):
                    return {
                        'status': True,
                        'message': 'Payment initialized successfully',
                        'authorization_url': data['data']['authorization_url'],
                        'reference': data['data']['reference'],
                        'access_code': data['data']['access_code']
                    }
                else:
                    return {
                        'status': False,
                        'message': data.get('message', 'Payment initialization failed')
                    }
            else:
                return {
                    'status': False,
                    'message': f'Paystack API error: {response.status_code}'
                }

        except Exception as e:
            print(f"Payment initialization error: {e}")
            return {
                'status': False,
                'message': f'Payment initialization failed: {str(e)}'
            }

    def verify_payment(self, reference: str) -> Dict:
        """Verify a payment with Paystack"""
        try:
            if not self.paystack_secret_key:
                return {
                    'status': False,
                    'message': 'Paystack not configured'
                }

            headers = {
                'Authorization': f'Bearer {self.paystack_secret_key}',
                'Content-Type': 'application/json'
            }

            response = requests.get(
                f'https://api.paystack.co/transaction/verify/{reference}',
                headers=headers
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('status'):
                    transaction_data = data['data']
                    
                    # Check if payment was successful
                    if transaction_data['status'] == 'success':
                        return {
                            'status': True,
                            'message': 'Payment verified successfully',
                            'data': transaction_data
                        }
                    else:
                        return {
                            'status': False,
                            'message': f'Payment not successful: {transaction_data["status"]}'
                        }
                else:
                    return {
                        'status': False,
                        'message': data.get('message', 'Payment verification failed')
                    }
            else:
                return {
                    'status': False,
                    'message': f'Paystack API error: {response.status_code}'
                }

        except Exception as e:
            print(f"Payment verification error: {e}")
            return {
                'status': False,
                'message': f'Payment verification failed: {str(e)}'
            }

    def record_usage(self, user_id: str, feature_name: str) -> Dict:
        """Record feature usage for subscription tracking"""
        try:
            # Record usage in database
            usage_data = {
                'user_id': user_id,
                'feature_name': feature_name,
                'month': datetime.now().strftime('%Y-%m'),
                'created_at': datetime.now().isoformat()
            }

            result = self.supabase.table('usage_tracking').insert(usage_data).execute()

            if result.data:
                return {
                    'status': 'success',
                    'message': 'Usage recorded successfully'
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Failed to record usage'
                }

        except Exception as e:
            print(f"Usage recording error: {e}")
            return {
                'status': 'error',
                'message': f'Usage recording failed: {str(e)}'
            }

    def get_subscription_status(self, user_id: str) -> Dict:
        """Get user's subscription status"""
        try:
            # Get user's subscription
            subscription_result = self.supabase.table('subscriptions').select('*').eq('user_id', user_id).eq('is_active', True).execute()

            if subscription_result.data:
                subscription = subscription_result.data[0]
                return {
                    'status': 'success',
                    'subscription': subscription,
                    'plan': subscription.get('plan_name', 'free')
                }
            else:
                return {
                    'status': 'success',
                    'subscription': None,
                    'plan': 'free'
                }
            
        except Exception as e:
            print(f"Subscription status error: {e}")
            return {
                'status': 'error',
                'message': f'Failed to get subscription status: {str(e)}'
            }

    def can_use_feature(self, user_id: str, feature_name: str) -> Dict:
        """Check if user can use a specific feature"""
        try:
            # Get user's subscription
            subscription_result = self.supabase.table('subscriptions').select('*').eq('user_id', user_id).eq('is_active', True).execute()

            if not subscription_result.data:
                # No subscription, check trial status
                return self._check_trial_status(user_id, feature_name)

            subscription = subscription_result.data[0]
            plan_name = subscription.get('plan_name', 'free')

            # Get usage for this month
            current_month = datetime.now().strftime('%Y-%m')
            usage_result = self.supabase.table('usage_tracking').select('*').eq('user_id', user_id).eq('feature_name', feature_name).eq('month', current_month).execute()

            current_usage = len(usage_result.data) if usage_result.data else 0

            # Get plan limits
            plan_limits = self._get_plan_limits(plan_name)
            limit = plan_limits.get(feature_name, 0)

            can_use = limit == -1 or current_usage < limit  # -1 means unlimited

            return {
                'can_use': can_use,
                'current_usage': current_usage,
                'limit': limit,
                'remaining': -1 if limit == -1 else max(0, limit - current_usage),
                'plan_name': plan_name
            }

        except Exception as e:
            print(f"Feature check error: {e}")
        return {
                'can_use': False,
                'current_usage': 0,
                'limit': 0,
                'remaining': 0,
                'plan_name': 'free',
                'error': str(e)
            }

    def _check_trial_status(self, user_id: str, feature_name: str) -> Dict:
        """Check trial status for free users"""
        try:
            # Check if user has any usage (trial started)
            usage_result = self.supabase.table('usage_tracking').select('*').eq('user_id', user_id).execute()

            if not usage_result.data:
                # No usage yet, trial hasn't started
                return {
                    'can_use': True,
                    'current_usage': 0,
                    'limit': 5,  # Trial limit
                    'remaining': 5,
                    'plan_name': 'trial'
                }

            # Check trial period (3 days from first usage)
            first_usage = min(usage_result.data, key=lambda x: x['created_at'])
            trial_start = datetime.fromisoformat(first_usage['created_at'].replace('Z', '+00:00'))
            trial_end = trial_start + timedelta(days=3)

            if datetime.now() > trial_end:
                # Trial expired
                return {
                    'can_use': False,
                    'current_usage': len(usage_result.data),
                    'limit': 5,
                    'remaining': 0,
                    'plan_name': 'trial_expired'
                }
            else:
                # Trial active
                current_usage = len([u for u in usage_result.data if u['feature_name'] == feature_name])
                return {
                    'can_use': current_usage < 5,
                    'current_usage': current_usage,
                    'limit': 5,
                    'remaining': max(0, 5 - current_usage),
                    'plan_name': 'trial'
                }

        except Exception as e:
            print(f"Trial status check error: {e}")
        return {
                'can_use': False,
                'current_usage': 0,
                'limit': 0,
                'remaining': 0,
                'plan_name': 'trial_expired'
            }

    def _get_plan_limits(self, plan_name: str) -> Dict:
        """Get feature limits for a plan"""
        limits = {
            'free': {
                    'food_detection': 5,
                    'meal_planning': 3,
                'ai_kitchen': 5
            },
            'weekly': {
                'food_detection': -1,
                'meal_planning': -1,
                'ai_kitchen': -1
            },
            'two_weeks': {
                'food_detection': -1,
                'meal_planning': -1,
                'ai_kitchen': -1
            },
            'monthly': {
                'food_detection': -1,
                'meal_planning': -1,
                'ai_kitchen': -1
            }
        }
        return limits.get(plan_name, limits['free']) 