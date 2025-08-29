import os
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional

class SimulatedPaymentService:
    """Simulated payment service for testing and development"""
    
    def __init__(self):
        pass
    
    def initialize_payment(self, email: str, amount: float, currency: str = 'USD', 
                          plan_id: str = None, user_id: str = None, metadata: Dict = None) -> Dict:
        """Simulate payment initialization"""
        return {
            'status': True,
            'message': 'Payment initialized successfully (simulated)',
            'authorization_url': 'https://example.com/simulated-payment',
            'reference': f'sim_ref_{datetime.now().timestamp()}',
            'access_code': f'sim_code_{datetime.now().timestamp()}'
        }
    
    def verify_payment(self, reference: str) -> Dict:
        """Simulate payment verification"""
        return {
            'status': True,
            'message': 'Payment verified successfully (simulated)',
            'data': {
                'status': 'success',
                'reference': reference,
                'amount': 1000,
                'currency': 'USD'
            }
        }
    
    def test_connection(self):
        """Simulate connection test"""
        class MockResponse:
            status_code = 200
        return MockResponse()

class PaymentService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.paystack_secret_key = os.getenv('PAYSTACK_SECRET_KEY')
        self.paystack_public_key = os.getenv('PAYSTACK_PUBLIC_KEY')
        
        # Payment service initialized

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
            # Check if usage_tracking table exists
            try:
                usage_data = {
                    'user_id': user_id,
                    'feature_name': feature_name,
                    'usage_date': datetime.now().date().isoformat(),
                    'usage_count': 1
                }
                result = self.supabase.table('usage_tracking').insert(usage_data).execute()
                
                return {
                    'status': 'success',
                    'message': 'Usage recorded successfully'
                }
            except Exception as table_error:
                print(f"usage_tracking table not available: {table_error}")
                # Return success even if table doesn't exist
                return {
                    'status': 'success',
                    'message': 'Usage recorded (table not available)'
                }

        except Exception as e:
            print(f"Usage recording error: {e}")
            return {
                'status': 'error',
                'message': f'Failed to record usage: {str(e)}'
            }

    def get_subscription_status(self, user_id: str) -> Dict:
        """Get user's subscription status"""
        try:
            # Check if user_subscriptions table exists
            try:
                subscription_result = self.supabase.table('user_subscriptions').select('*').eq('user_id', user_id).eq('status', 'active').execute()
            except Exception as table_error:
                print(f"user_subscriptions table not available: {table_error}")
                # Check if it's trying to access the old 'subscriptions' table
                if "subscriptions" in str(table_error) and "does not exist" in str(table_error):
                    print("⚠️  Detected attempt to access old 'subscriptions' table. Using 'user_subscriptions' instead.")
                    try:
                        subscription_result = self.supabase.table('user_subscriptions').select('*').eq('user_id', user_id).eq('status', 'active').execute()
                    except Exception as retry_error:
                        print(f"user_subscriptions table also not available: {retry_error}")
                        # Return default free plan status
                        return {
                            'status': 'success',
                            'subscription': None,
                            'plan': 'free',
                            'subscription_status': 'active',
                            'is_subscribed': False,
                            'trial_days_left': 3,
                            'is_in_trial': True
                        }
                else:
                    # Return default free plan status
                    return {
                        'status': 'success',
                        'subscription': None,
                        'plan': 'free',
                        'subscription_status': 'active',
                        'is_subscribed': False,
                        'trial_days_left': 3,
                        'is_in_trial': True
                    }

            if not subscription_result.data:
                # No subscription, return free plan status
                return {
                    'status': 'success',
                    'subscription': None,
                    'plan': 'free',
                    'subscription_status': 'active',
                    'is_subscribed': False,
                    'trial_days_left': 3,
                    'is_in_trial': True
                }

            subscription = subscription_result.data[0]
            
            # Get plan details from subscription_plans table
            try:
                plan_result = self.supabase.table('subscription_plans').select('name, display_name').eq('id', subscription.get('plan_id')).execute()
                if plan_result.data:
                    plan_name = plan_result.data[0].get('name', 'free')
                    plan_display_name = plan_result.data[0].get('display_name', 'Free Plan')
                else:
                    plan_name = 'free'
                    plan_display_name = 'Free Plan'
            except Exception as plan_error:
                print(f"subscription_plans table not available: {plan_error}")
                plan_name = 'free'
                plan_display_name = 'Free Plan'
            
            return {
                'status': 'success',
                'subscription': subscription,
                'plan': plan_name,
                'plan_display_name': plan_display_name,
                'subscription_status': subscription.get('status', 'active'),
                'is_subscribed': True,
                'trial_days_left': 0,
                'is_in_trial': False
            }

        except Exception as e:
            print(f"Subscription status error: {e}")
            # Return default free plan status on error
            return {
                'status': 'success',
                'subscription': None,
                'plan': 'free',
                'subscription_status': 'active',
                'is_subscribed': False,
                'trial_days_left': 3,
                'is_in_trial': True,
                'error': str(e)
            }

    def can_use_feature(self, user_id: str, feature_name: str) -> Dict:
        """Check if user can use a specific feature based on their subscription"""
        try:
            # Check if user_subscriptions table exists
            try:
                subscription_result = self.supabase.table('user_subscriptions').select('*').eq('user_id', user_id).eq('status', 'active').execute()
            except Exception as table_error:
                print(f"user_subscriptions table not available: {table_error}")
                # Return default trial status
                return {
                    'can_use': True,
                    'current_usage': 0,
                    'limit': 5,
                    'remaining': 5,
                    'plan_name': 'trial'
                }

            if not subscription_result.data:
                # No subscription, check trial status
                return self._check_trial_status(user_id, feature_name)

            subscription = subscription_result.data[0]
            plan_id = subscription.get('plan_id', 'free')

            # Check if usage_tracking table exists
            try:
                # Get usage for this month
                current_month = datetime.now().strftime('%Y-%m')
                usage_result = self.supabase.table('usage_tracking').select('*').eq('user_id', user_id).eq('feature_name', feature_name).gte('usage_date', f'{current_month}-01').lt('usage_date', f'{current_month}-32').execute()

                current_usage = len(usage_result.data) if usage_result.data else 0
            except Exception as usage_table_error:
                print(f"usage_tracking table not available: {usage_table_error}")
                current_usage = 0

            # Get plan limits from subscription_plans table
            try:
                plan_result = self.supabase.table('subscription_plans').select('limits').eq('id', plan_id).execute()
                if plan_result.data:
                    plan_limits = plan_result.data[0].get('limits', {})
                else:
                    plan_limits = self._get_plan_limits('free')
            except Exception as plan_error:
                print(f"subscription_plans table not available: {plan_error}")
                plan_limits = self._get_plan_limits('free')

            limit = plan_limits.get(feature_name, 0)

            can_use = limit == -1 or current_usage < limit  # -1 means unlimited

            return {
                'can_use': can_use,
                'current_usage': current_usage,
                'limit': limit,
                'remaining': -1 if limit == -1 else max(0, limit - current_usage),
                'plan_name': plan_id
            }

        except Exception as e:
            print(f"Feature check error: {e}")
            return {
                'can_use': True,  # Default to allowing usage
                'current_usage': 0,
                'limit': 5,
                'remaining': 5,
                'plan_name': 'trial',
                'error': str(e)
            }

    def _check_trial_status(self, user_id: str, feature_name: str) -> Dict:
        """Check trial status for free users"""
        try:
            # Check if usage_tracking table exists
            try:
                usage_result = self.supabase.table('usage_tracking').select('*').eq('user_id', user_id).execute()
            except Exception as table_error:
                print(f"usage_tracking table not available: {table_error}")
                # Return default trial status
                return {
                    'can_use': True,
                    'current_usage': 0,
                    'limit': 5,
                    'remaining': 5,
                    'plan_name': 'trial'
                }

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
                'can_use': True,  # Default to allowing usage
                'current_usage': 0,
                'limit': 5,
                'remaining': 5,
                'plan_name': 'trial'
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