#!/usr/bin/env python3
"""
Test Subscription Setup Script
Give 3 random users a 1-week premium subscription for testing
"""

import os
import sys
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from database import get_db_connection
from config.subscription import PAID_PLANS

def setup_test_subscriptions():
    """Set up test subscriptions for 3 random users"""
    
    with get_db_connection() as supabase:
        try:
            print("🔄 Setting up test subscriptions...")
            
            # 1. Ensure weekly plan exists
            print("📋 Checking/creating weekly plan...")
            
            # Check if weekly plan exists
            result = supabase.table('subscription_plans').select('*').eq('name', 'weekly').execute()
            
            if not result.data:
                # Create weekly plan
                weekly_plan_data = {
                    'name': 'weekly',
                    'display_name': 'Weekly Plan',
                    'price_monthly': 8.00,
                    'price_yearly': 0.00,
                    'features': {
                        'food_detection': True,
                        'meal_planning': True,
                        'recipe_generation': True,
                        'priority_support': True
                    },
                    'limits': {
                        'food_detection_per_week': -1,
                        'meal_planning_per_week': -1,
                        'recipe_generation_per_week': -1
                    },
                    'duration_days': 7,
                    'billing_cycle': 'weekly',
                    'currency': 'USD'
                }
                
                result = supabase.table('subscription_plans').insert(weekly_plan_data).execute()
                weekly_plan_id = result.data[0]['id']
                print(f"✅ Created weekly plan with ID: {weekly_plan_id}")
            else:
                weekly_plan_id = result.data[0]['id']
                print(f"✅ Weekly plan already exists with ID: {weekly_plan_id}")
            
            # 2. Get 3 random users without active subscriptions
            print("👥 Finding users without active subscriptions...")
            
            # Get all users from profiles table
            users_result = supabase.table('profiles').select('id, email, created_at').execute()
            
            # Get users with active subscriptions
            active_subs_result = supabase.table('user_subscriptions').select('user_id').eq('status', 'active').execute()
            active_user_ids = {sub['user_id'] for sub in active_subs_result.data}
            
            # Filter users without active subscriptions
            available_users = [user for user in users_result.data if user['id'] not in active_user_ids]
            
            if len(available_users) < 3:
                print(f"⚠️  Only {len(available_users)} users available without active subscriptions")
                if len(available_users) == 0:
                    print("❌ No users found without active subscriptions")
                    return
            else:
                # Take 3 random users
                import random
                available_users = random.sample(available_users, 3)
            
            print(f"✅ Found {len(available_users)} users to give test subscriptions")
            
            # 3. Create subscriptions for each user
            for user in available_users:
                user_id = user['id']
                email = user['email']
                print(f"\n🎁 Setting up subscription for: {email}")
                
                # Calculate subscription dates
                start_date = datetime.now().isoformat()
                end_date = (datetime.now() + timedelta(days=7)).isoformat()
                
                # Create subscription
                subscription_data = {
                    'user_id': user_id,
                    'plan_id': weekly_plan_id,
                    'status': 'active',
                    'current_period_start': start_date,
                    'current_period_end': end_date,
                    'paystack_subscription_id': f'test_sub_{user_id}',
                    'paystack_customer_id': f'test_customer_{user_id}',
                    'metadata': {
                        'test_subscription': True,
                        'created_by': 'test_script'
                    }
                }
                
                sub_result = supabase.table('user_subscriptions').insert(subscription_data).execute()
                subscription_id = sub_result.data[0]['id']
                print(f"   ✅ Created subscription ID: {subscription_id}")
                
                # Create payment transaction
                payment_data = {
                    'user_id': user_id,
                    'subscription_id': subscription_id,
                    'paystack_transaction_id': f'test_txn_{user_id}',
                    'paystack_reference': f'test_ref_{user_id}',
                    'amount': 8.00,
                    'currency': 'USD',
                    'status': 'success',
                    'payment_method': 'test_card',
                    'description': 'Test Weekly Plan Subscription',
                    'metadata': {
                        'test_payment': True,
                        'created_by': 'test_script'
                    }
                }
                
                supabase.table('payment_transactions').insert(payment_data).execute()
                print(f"   ✅ Created payment transaction")
                print(f"   📅 Subscription expires: {end_date}")
            
            # 4. Verify the setup
            print("\n🔍 Verifying test subscriptions...")
            
            verify_result = supabase.table('user_subscriptions').select('''
                id,
                user_id,
                status,
                current_period_start,
                current_period_end,
                paystack_subscription_id,
                subscription_plans!inner(name, display_name),
                payment_transactions!inner(amount, currency, status)
            ''').like('paystack_subscription_id', 'test_sub_%').execute()
            
            test_subscriptions = verify_result.data
            
            print(f"\n📊 Test Subscription Summary:")
            print("=" * 80)
            for sub in test_subscriptions:
                print(f"👤 User ID: {sub['user_id']}")
                print(f"📦 Plan: {sub['subscription_plans']['display_name']} ({sub['subscription_plans']['name']})")
                print(f"📅 Period: {sub['current_period_start'][:10]} to {sub['current_period_end'][:10]}")
                print(f"💰 Payment: {sub['payment_transactions']['amount']} {sub['payment_transactions']['currency']} ({sub['payment_transactions']['status']})")
                print(f"🆔 Subscription ID: {sub['paystack_subscription_id']}")
                print("-" * 40)
            
            print(f"\n🎉 Successfully set up {len(test_subscriptions)} test subscriptions!")
            print("💡 These users now have full access to all premium features for 7 days")
            
        except Exception as e:
            print(f"❌ Error setting up test subscriptions: {e}")
            raise

def cleanup_test_subscriptions():
    """Clean up test subscriptions (optional)"""
    
    with get_db_connection() as supabase:
        try:
            print("🧹 Cleaning up test subscriptions...")
            
            # Delete test payment transactions
            supabase.table('payment_transactions').delete().like('paystack_transaction_id', 'test_txn_%').execute()
            
            # Delete test subscriptions
            supabase.table('user_subscriptions').delete().like('paystack_subscription_id', 'test_sub_%').execute()
            
            print("✅ Test subscriptions cleaned up successfully!")
            
        except Exception as e:
            print(f"❌ Error cleaning up test subscriptions: {e}")
            raise

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Set up test subscriptions for MealLens AI")
    parser.add_argument("--cleanup", action="store_true", help="Clean up test subscriptions instead of creating them")
    
    args = parser.parse_args()
    
    if args.cleanup:
        cleanup_test_subscriptions()
    else:
        setup_test_subscriptions() 