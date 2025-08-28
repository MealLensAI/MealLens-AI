import os
import requests
import json
from typing import Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from supabase import Client
import hashlib
import hmac
from .payment_providers import PaymentProviderFactory, PaymentProvider

class PaymentService:
    """
    Service for handling multiple payment providers, subscriptions, and usage tracking.
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.providers = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available payment providers"""
        try:
            # Initialize Paystack if credentials are available
            if os.environ.get('PAYSTACK_SECRET_KEY'):
                self.providers['paystack'] = PaymentProviderFactory.create_provider('paystack')
                print("[PaymentService] Paystack provider initialized")
        except Exception as e:
            print(f"[PaymentService] Failed to initialize Paystack: {e}")
        
        try:
            # Initialize M-Pesa if credentials are available
            if os.environ.get('MPESA_CONSUMER_KEY'):
                self.providers['mpesa'] = PaymentProviderFactory.create_provider('mpesa')
                print("[PaymentService] M-Pesa provider initialized")
        except Exception as e:
            print(f"[PaymentService] Failed to initialize M-Pesa: {e}")
        
        try:
            # Initialize Stripe if credentials are available
            if os.environ.get('STRIPE_SECRET_KEY'):
                self.providers['stripe'] = PaymentProviderFactory.create_provider('stripe')
                print("[PaymentService] Stripe provider initialized")
        except Exception as e:
            print(f"[PaymentService] Failed to initialize Stripe: {e}")
        
        if not self.providers:
            print("[PaymentService] No payment providers initialized")
    
    def get_available_providers(self) -> Dict[str, Dict]:
        """Get list of available payment providers"""
        available = {}
        for provider_name, provider in self.providers.items():
            try:
                available[provider_name] = {
                    'name': provider.get_provider_name(),
                    'currencies': provider.get_supported_currencies(),
                    'capabilities': PaymentProviderFactory.get_available_providers().get(provider_name, {})
                }
            except Exception as e:
                print(f"[PaymentService] Error getting provider info for {provider_name}: {e}")
        
        return available
    
    def get_best_provider_for_currency(self, currency: str) -> Optional[str]:
        """Get the best payment provider for a given currency"""
        for provider_name, provider in self.providers.items():
            if currency in provider.get_supported_currencies():
                return provider_name
        return None
    
    def initialize_payment(self, email: str, amount: float, currency: str, reference: str, 
                          callback_url: str, provider: str = None, metadata: Dict = None) -> Dict:
        """Initialize a payment with the specified or best available provider"""
        
        # If no provider specified, choose the best one for the currency
        if not provider:
            provider = self.get_best_provider_for_currency(currency)
            if not provider:
                return {
                    'status': False,
                    'message': f'No payment provider available for currency: {currency}'
                }
        
        # Check if provider is available
        if provider not in self.providers:
            return {
                'status': False,
                'message': f'Payment provider not available: {provider}'
            }
        
        # Check if provider supports the currency
        provider_instance = self.providers[provider]
        if currency not in provider_instance.get_supported_currencies():
            return {
                'status': False,
                'message': f'Provider {provider} does not support currency: {currency}'
        }
        
        try:
            # Initialize payment with the provider
            result = provider_instance.initialize_payment(
                amount=amount,
                currency=currency,
                email=email,
                reference=reference,
                callback_url=callback_url,
                metadata=metadata or {}
            )
            
            # Add provider information to result
            if result.get('status'):
                result['provider'] = provider
                result['supported_currencies'] = provider_instance.get_supported_currencies()
            
            return result
            
        except Exception as e:
            return {
                'status': False,
                'message': f'Payment initialization failed: {str(e)}',
                'provider': provider
            }
    
    def verify_payment(self, reference: str, provider: str = None) -> Dict:
        """Verify a payment with the specified provider"""
        
        # If no provider specified, try to determine from transaction record
        if not provider:
            # Try to get provider from transaction record in database
            try:
                transaction = self.supabase.table('transactions').select('provider').eq('reference', reference).execute()
                if transaction.data:
                    provider = transaction.data[0].get('provider', 'paystack')  # Default to paystack
                else:
                    provider = 'paystack'  # Default fallback
            except Exception:
                provider = 'paystack'  # Default fallback
        
        # Check if provider is available
        if provider not in self.providers:
            return {
                'status': False,
                'message': f'Payment provider not available: {provider}'
            }
        
        try:
            # Verify payment with the provider
            result = self.providers[provider].verify_payment(reference)
            
            # Add provider information to result
            if result.get('status'):
                result['provider'] = provider
            
            return result
            
        except Exception as e:
            return {
                'status': False,
                'message': f'Payment verification failed: {str(e)}',
                'provider': provider
            }
    
    def create_customer(self, email: str, first_name: str = None, last_name: str = None) -> Dict:
        """Create a customer (Paystack-specific, kept for backward compatibility)"""
        if 'paystack' not in self.providers:
            return {
                'status': False,
                'message': 'Paystack provider not available'
            }
        
        # Use Paystack's customer creation
        provider = self.providers['paystack']
        # This would need to be implemented in the PaystackProvider class
        return {
            'status': False,
            'message': 'Customer creation not implemented for multi-provider system'
        }
    
    def create_subscription(self, customer_email: str, plan_code: str, 
                          start_date: str = None) -> Dict:
        """Create a subscription (Paystack-specific, kept for backward compatibility)"""
        if 'paystack' not in self.providers:
            return {
                'status': False,
                'message': 'Paystack provider not available'
            }
        
        # Use Paystack's subscription creation
        provider = self.providers['paystack']
        # This would need to be implemented in the PaystackProvider class
        return {
            'status': False,
            'message': 'Subscription creation not implemented for multi-provider system'
        }
    
    def can_use_feature(self, user_id: str, feature_name: str) -> Dict:
        """Check if user can use a specific feature based on their subscription and usage"""
        try:
            # Get user's subscription
            subscription_result = self.supabase.table('subscriptions').select('*').eq('user_id', user_id).execute()
            
            if not subscription_result.data:
                # No subscription found, check trial status
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
            print(f"Error checking feature usage: {e}")
            return {
                'can_use': True,  # Allow usage on error
                'current_usage': 0,
                'limit': -1,
                'remaining': -1,
                'plan_name': 'free'
            }
    
    def _check_trial_status(self, user_id: str, feature_name: str) -> Dict:
        """Check if user is still in trial period"""
        try:
            # Get first usage date
            first_usage_result = self.supabase.table('usage_tracking').select('created_at').eq('user_id', user_id).order('created_at', desc=False).limit(1).execute()
            
            if not first_usage_result.data:
                # No usage recorded yet, allow trial
                return {
                    'can_use': True,
                    'current_usage': 0,
                    'limit': -1,
                    'remaining': -1,
                    'plan_name': 'trial'
                }
            
            first_usage_date = datetime.fromisoformat(first_usage_result.data[0]['created_at'].replace('Z', '+00:00'))
            trial_end_date = first_usage_date + timedelta(days=3)  # 3-day trial
            
            if datetime.now() < trial_end_date:
                return {
                    'can_use': True,
                    'current_usage': 0,
                    'limit': -1,
                    'remaining': -1,
                    'plan_name': 'trial'
                }
            else:
                return {
                    'can_use': False,
                    'current_usage': 0,
                    'limit': 0,
                    'remaining': 0,
                    'plan_name': 'trial_expired'
                }
                
        except Exception as e:
            print(f"Error checking trial status: {e}")
            return {
                'can_use': True,
                'current_usage': 0,
                'limit': -1,
                'remaining': -1,
                'plan_name': 'trial'
            }
    
    def _get_plan_limits(self, plan_name: str) -> Dict:
        """Get feature limits for a plan"""
        limits = {
            'free': {
                'food_detection': 5,
                'ingredient_detection': 5,
                'meal_planning': 3
            },
            'weekly': {
                'food_detection': -1,
                'ingredient_detection': -1,
                'meal_planning': -1
            },
            'two_weeks': {
                'food_detection': -1,
                'ingredient_detection': -1,
                'meal_planning': -1
            },
            'monthly': {
                'food_detection': -1,
                'ingredient_detection': -1,
                'meal_planning': -1
            }
        }
        
        return limits.get(plan_name, limits['free'])
    
    def record_usage(self, user_id: str, feature_name: str) -> Dict:
        """Record usage of a feature"""
        try:
            current_month = datetime.now().strftime('%Y-%m')
            
            # Insert usage record
            usage_data = {
                'user_id': user_id,
                'feature_name': feature_name,
                'month': current_month,
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('usage_tracking').insert(usage_data).execute()
            
            return {
                'status': 'success',
                'message': 'Usage recorded successfully',
                'data': result.data[0] if result.data else None
            }
            
        except Exception as e:
            print(f"Error recording usage: {e}")
            return {
                'status': 'error',
                'message': f'Failed to record usage: {str(e)}'
            }
    
    def update_transaction_status(self, reference: str, status: str, provider: str = None) -> Dict:
        """Update transaction status in database"""
        try:
            update_data = {
                'status': status,
                    'updated_at': datetime.now().isoformat()
            }
            
            if provider:
                update_data['provider'] = provider
            
            result = self.supabase.table('transactions').update(update_data).eq('reference', reference).execute()
            
            return {
                'status': 'success',
                'message': 'Transaction status updated successfully',
                'data': result.data[0] if result.data else None
            }
            
        except Exception as e:
            print(f"Error updating transaction status: {e}")
            return {
                'status': 'error',
                'message': f'Failed to update transaction status: {str(e)}'
            }

# Keep the SimulatedPaymentService for backward compatibility
class SimulatedPaymentService(PaymentService):
    """Simulated payment service for testing"""
    
    def __init__(self, supabase_client: Client):
        super().__init__(supabase_client)
        print("[SimulatedPaymentService] Using simulated payment service for testing")
    
    def initialize_payment(self, email: str, amount: float, currency: str, reference: str, 
                          callback_url: str, provider: str = None, metadata: Dict = None) -> Dict:
        """Simulate payment initialization"""
        return {
            'status': True,
            'message': 'Payment initialized successfully (simulated)',
            'data': {
                'authorization_url': f'{callback_url}?reference={reference}&status=success',
                'reference': reference,
                'provider': provider or 'simulated'
            }
        }

    def verify_payment(self, reference: str, provider: str = None) -> Dict:
        """Simulate payment verification"""
        return {
            'status': True,
            'message': 'Payment verified successfully (simulated)',
            'data': {
                'status': 'success',
                'reference': reference,
                'provider': provider or 'simulated'
            }
        } 