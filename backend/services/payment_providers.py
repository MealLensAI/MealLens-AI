from abc import ABC, abstractmethod
from typing import Dict, Optional, Any
import requests
import os
import json
from datetime import datetime

class PaymentProvider(ABC):
    """Abstract base class for payment providers"""
    
    @abstractmethod
    def initialize_payment(self, amount: float, currency: str, email: str, 
                          reference: str, callback_url: str, metadata: Dict = None) -> Dict:
        """Initialize a payment transaction"""
        pass
    
    @abstractmethod
    def verify_payment(self, reference: str) -> Dict:
        """Verify a payment transaction"""
        pass
    
    @abstractmethod
    def get_supported_currencies(self) -> list:
        """Get list of supported currencies"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get provider name"""
        pass

class PaystackProvider(PaymentProvider):
    """Paystack payment provider implementation with M-Pesa and mobile money support"""
    
    def __init__(self):
        self.secret_key = os.environ.get('PAYSTACK_SECRET_KEY')
        self.public_key = os.environ.get('PAYSTACK_PUBLIC_KEY')
        self.base_url = 'https://api.paystack.co'
        
        if not self.secret_key:
            raise ValueError("PAYSTACK_SECRET_KEY environment variable is required")
    
    def initialize_payment(self, amount: float, currency: str, email: str, 
                          reference: str, callback_url: str, metadata: Dict = None) -> Dict:
        """Initialize Paystack payment with M-Pesa and mobile money support"""
        url = f"{self.base_url}/transaction/initialize"
        headers = {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }
        
        # Convert amount to kobo (smallest currency unit)
        amount_in_kobo = int(amount * 100)
        
        # Determine payment channels based on currency
        channels = self._get_payment_channels(currency)
        
        data = {
            'email': email,
            'amount': amount_in_kobo,
            'currency': currency,
            'reference': reference,
            'callback_url': callback_url,
            'channels': channels,  # Enable multiple payment channels
            'metadata': metadata or {}
        }
        
        # Add phone number for mobile money if available
        if metadata and metadata.get('phone_number'):
            data['phone'] = metadata.get('phone_number')
        
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'Paystack API error: {str(e)}'
            }
    
    def _get_payment_channels(self, currency: str) -> list:
        """Get available payment channels based on currency"""
        if currency == 'KES':
            # Kenya: M-Pesa, Airtel Money, Equitel, Card, Bank
            return ['card', 'bank', 'ussd', 'mobile_money', 'qr']
        elif currency == 'NGN':
            # Nigeria: Card, Bank, USSD, QR
            return ['card', 'bank', 'ussd', 'qr']
        elif currency == 'GHS':
            # Ghana: Mobile Money, Card, Bank
            return ['card', 'bank', 'mobile_money']
        elif currency == 'ZAR':
            # South Africa: Card, Bank, EFT
            return ['card', 'bank']
        elif currency == 'UGX':
            # Uganda: Mobile Money, Card, Bank
            return ['card', 'bank', 'mobile_money']
        elif currency == 'TZS':
            # Tanzania: Mobile Money, Card, Bank
            return ['card', 'bank', 'mobile_money']
        else:
            # Default: Card and Bank
            return ['card', 'bank']
    
    def verify_payment(self, reference: str) -> Dict:
        """Verify a Paystack payment"""
        url = f"{self.base_url}/transaction/verify/{reference}"
        headers = {
            'Authorization': f'Bearer {self.secret_key}'
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'Paystack verification error: {str(e)}'
            }
    
    def get_supported_currencies(self) -> list:
        """Get Paystack supported currencies"""
        return ['NGN', 'USD', 'GHS', 'ZAR', 'KES', 'UGX', 'TZS', 'XOF', 'XAF', 'EGP']
    
    def get_provider_name(self) -> str:
        return 'paystack'
    
    def get_payment_methods(self, currency: str) -> Dict:
        """Get available payment methods for a currency"""
        methods = {
            'KES': {
                'mobile_money': {
                    'name': 'M-Pesa',
                    'description': 'Pay with M-Pesa mobile money',
                    'icon': 'Smartphone',
                    'instructions': 'You will receive an M-Pesa prompt on your phone'
                },
                'card': {
                    'name': 'Card Payment',
                    'description': 'Pay with Visa, Mastercard, or Verve',
                    'icon': 'CreditCard'
                },
                'bank': {
                    'name': 'Bank Transfer',
                    'description': 'Pay directly from your bank account',
                    'icon': 'Building'
                },
                'ussd': {
                    'name': 'USSD',
                    'description': 'Pay using USSD code *996#',
                    'icon': 'Phone'
                }
            },
            'NGN': {
                'card': {
                    'name': 'Card Payment',
                    'description': 'Pay with Visa, Mastercard, or Verve',
                    'icon': 'CreditCard'
                },
                'bank': {
                    'name': 'Bank Transfer',
                    'description': 'Pay directly from your bank account',
                    'icon': 'Building'
                },
                'ussd': {
                    'name': 'USSD',
                    'description': 'Pay using USSD code *996#',
                    'icon': 'Phone'
                }
            },
            'GHS': {
                'mobile_money': {
                    'name': 'Mobile Money',
                    'description': 'Pay with MTN Mobile Money or Vodafone Cash',
                    'icon': 'Smartphone'
                },
                'card': {
                    'name': 'Card Payment',
                    'description': 'Pay with Visa or Mastercard',
                    'icon': 'CreditCard'
                },
                'bank': {
                    'name': 'Bank Transfer',
                    'description': 'Pay directly from your bank account',
                    'icon': 'Building'
                }
            }
        }
        
        return methods.get(currency, {
            'card': {
                'name': 'Card Payment',
                'description': 'Pay with your credit or debit card',
                'icon': 'CreditCard'
            },
            'bank': {
                'name': 'Bank Transfer',
                'description': 'Pay directly from your bank account',
                'icon': 'Building'
            }
        })

class MPesaProvider(PaymentProvider):
    """M-Pesa payment provider implementation (Direct Safaricom API)"""
    
    def __init__(self):
        self.consumer_key = os.environ.get('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.environ.get('MPESA_CONSUMER_SECRET')
        self.passkey = os.environ.get('MPESA_PASSKEY')
        self.business_shortcode = os.environ.get('MPESA_BUSINESS_SHORTCODE')
        self.environment = os.environ.get('MPESA_ENVIRONMENT', 'sandbox')  # sandbox or live
        
        if not all([self.consumer_key, self.consumer_secret, self.passkey, self.business_shortcode]):
            raise ValueError("M-Pesa environment variables are required")
        
        # Set base URL based on environment
        if self.environment == 'live':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
    
    def _get_access_token(self) -> str:
        """Get M-Pesa access token"""
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        auth = (self.consumer_key, self.consumer_secret)
        
        try:
            response = requests.get(url, auth=auth)
            response.raise_for_status()
            return response.json()['access_token']
        except Exception as e:
            raise Exception(f"Failed to get M-Pesa access token: {str(e)}")
    
    def initialize_payment(self, amount: float, currency: str, email: str, 
                          reference: str, callback_url: str, metadata: Dict = None) -> Dict:
        """Initialize M-Pesa STK Push payment"""
        if currency != 'KES':
            return {
                'status': False,
                'message': 'M-Pesa only supports KES currency'
            }
        
        access_token = self._get_access_token()
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Generate timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Generate password
        password = self._generate_password(timestamp)
        
        data = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': metadata.get('phone_number', '') if metadata else '',
            'PartyB': self.business_shortcode,
            'PhoneNumber': metadata.get('phone_number', '') if metadata else '',
            'CallBackURL': callback_url,
            'AccountReference': reference,
            'TransactionDesc': metadata.get('description', 'MealLens Payment') if metadata else 'MealLens Payment'
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'M-Pesa API error: {str(e)}'
            }
    
    def _generate_password(self, timestamp: str) -> str:
        """Generate M-Pesa password"""
        import base64
        password_str = f"{self.business_shortcode}{self.passkey}{timestamp}"
        return base64.b64encode(password_str.encode()).decode()
    
    def verify_payment(self, reference: str) -> Dict:
        """Verify M-Pesa payment using reference"""
        # M-Pesa verification is typically done via webhook
        # This is a placeholder for manual verification
        return {
            'status': True,
            'message': 'M-Pesa payment verification requires webhook implementation',
            'reference': reference
        }
    
    def get_supported_currencies(self) -> list:
        """Get M-Pesa supported currencies"""
        return ['KES']
    
    def get_provider_name(self) -> str:
        return 'mpesa'

class StripeProvider(PaymentProvider):
    """Stripe payment provider implementation"""
    
    def __init__(self):
        self.secret_key = os.environ.get('STRIPE_SECRET_KEY')
        self.public_key = os.environ.get('STRIPE_PUBLIC_KEY')
        
        if not self.secret_key:
            raise ValueError("STRIPE_SECRET_KEY environment variable is required")
    
    def initialize_payment(self, amount: float, currency: str, email: str, 
                          reference: str, callback_url: str, metadata: Dict = None) -> Dict:
        """Initialize Stripe payment intent"""
        url = 'https://api.stripe.com/v1/payment_intents'
        headers = {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        # Convert amount to cents
        amount_in_cents = int(amount * 100)
        
        data = {
            'amount': amount_in_cents,
            'currency': currency.lower(),
            'metadata[reference]': reference,
            'metadata[email]': email,
            'receipt_email': email
        }
        
        if metadata:
            for key, value in metadata.items():
                data[f'metadata[{key}]'] = str(value)
        
        try:
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'Stripe API error: {str(e)}'
            }
    
    def verify_payment(self, reference: str) -> Dict:
        """Verify Stripe payment"""
        url = f'https://api.stripe.com/v1/payment_intents/{reference}'
        headers = {
            'Authorization': f'Bearer {self.secret_key}'
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'Stripe verification error: {str(e)}'
            }
    
    def get_supported_currencies(self) -> list:
        """Get Stripe supported currencies"""
        return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK']
    
    def get_provider_name(self) -> str:
        return 'stripe'

class PaymentProviderFactory:
    """Factory class to create payment providers"""
    
    @staticmethod
    def create_provider(provider_name: str) -> PaymentProvider:
        """Create a payment provider instance"""
        providers = {
            'paystack': PaystackProvider,
            'mpesa': MPesaProvider,
            'stripe': StripeProvider
        }
        
        if provider_name not in providers:
            raise ValueError(f"Unsupported payment provider: {provider_name}")
        
        return providers[provider_name]()
    
    @staticmethod
    def get_available_providers() -> Dict[str, Dict]:
        """Get list of available payment providers with their capabilities"""
        return {
            'paystack': {
                'name': 'Paystack',
                'currencies': ['NGN', 'USD', 'GHS', 'ZAR', 'KES', 'UGX', 'TZS', 'XOF', 'XAF', 'EGP'],
                'regions': ['Nigeria', 'Ghana', 'South Africa', 'Kenya', 'Uganda', 'Tanzania', 'West Africa', 'Central Africa', 'Egypt'],
                'features': ['Card Payments', 'Bank Transfers', 'Mobile Money (M-Pesa)', 'USSD', 'QR Payments'],
                'description': 'Unified payment platform with M-Pesa and mobile money support'
            },
            'mpesa': {
                'name': 'M-Pesa (Direct)',
                'currencies': ['KES'],
                'regions': ['Kenya', 'Tanzania', 'Uganda', 'Mozambique', 'Lesotho', 'Ghana', 'Egypt'],
                'features': ['Mobile Money', 'SMS Payments', 'USSD'],
                'description': 'Direct Safaricom M-Pesa integration'
            },
            'stripe': {
                'name': 'Stripe',
                'currencies': ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'],
                'regions': ['Global'],
                'features': ['Card Payments', 'Digital Wallets', 'Bank Transfers', 'Buy Now Pay Later'],
                'description': 'Global payment processing'
            }
        } 