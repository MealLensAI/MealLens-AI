from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import csv
import io
from services.auth_service import AuthService
from supabase import Client

admin_bp = Blueprint('admin', __name__)


def get_auth_service() -> Optional[AuthService]:
    """Helper function to get the AuthService from the app context."""
    if hasattr(current_app, 'auth_service'):
        return current_app.auth_service
    return None


def get_supabase_client() -> Optional[Client]:
    """Helper function to get the Supabase client with admin privileges."""
    if not hasattr(current_app, 'supabase_service') or not current_app.supabase_service:
        current_app.logger.error("Supabase service not initialized in app context")
        return None
    
    try:
        return current_app.supabase_service.supabase
    except Exception as e:
        current_app.logger.error(f"Error getting Supabase client: {str(e)}")
        return None


def verify_admin_access():
    """Verify that the current user has admin privileges."""
    try:
        auth_service = get_auth_service()
        if not auth_service:
            return None, "Authentication service not configured"
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None, "No Authorization header provided"
        
        user_id, auth_type = auth_service.get_supabase_user_id_from_token(auth_header)
        if not user_id:
            return None, f"Token verification failed. Auth type attempted: {auth_type}"
        
        # Check if user has admin role (you can modify this logic based on your admin system)
        # For now, we'll check if the user has admin metadata or is in a specific admin list
        supabase = get_supabase_client()
        if not supabase:
            return None, "Database connection failed"
        
        # Get user profile to check admin status
        profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        
        if not profile_response.data:
            return None, "User profile not found"
        
        profile = profile_response.data[0]
        
        # Check if user has admin role
        if profile.get('role') == 'admin':
            return user_id, None
        
        # Fallback: Check for specific admin emails (legacy support)
        if profile.get('email') == 'Admin' or profile.get('email') == 'admin@meallens.com':
            return user_id, None
        
        # Check admin emails from config
        admin_emails = current_app.config.get('ADMIN_EMAILS', [])
        if profile.get('email') in admin_emails:
            return user_id, None
        
        return None, "Access denied. Admin privileges required."
        
    except Exception as e:
        current_app.logger.error(f"Error verifying admin access: {str(e)}")
        return None, f"Admin verification error: {str(e)}"


@admin_bp.route('/test', methods=['GET'])
def test_admin():
    """Test route to check if admin routes are working."""
    return jsonify({
        'status': 'success',
        'message': 'Admin routes are working!',
        'timestamp': datetime.utcnow().isoformat()
    })


@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    """Get all users with their subscription and profile information."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Get query parameters for filtering
        page = request.args.get('page', 1, type=int)
        limit = min(request.args.get('limit', 50, type=int), 100)  # Max 100 per page
        search = request.args.get('search', '')
        status_filter = request.args.get('status', '')
        tier_filter = request.args.get('tier', '')
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build the query - get all profiles first, then get subscriptions separately
        query = supabase.table('profiles').select('*')
        
        # Apply search filter
        if search:
            query = query.or_(f'email.ilike.%{search}%,first_name.ilike.%{search}%,last_name.ilike.%{search}%')
        
        # Execute query with pagination
        response = query.range(offset, offset + limit - 1).order('created_at', desc=True).execute()
        
        if response.error:
            current_app.logger.error(f"Database error: {response.error}")
            return jsonify({'status': 'error', 'message': 'Database query failed'}), 500
        
        users = response.data
        
        # Get total count for pagination
        count_query = supabase.table('profiles').select('id', count='exact')
        if search:
            count_query = count_query.or_(f'email.ilike.%{search}%,first_name.ilike.%{search}%,last_name.ilike.%{search}%')
        
        count_response = count_query.execute()
        total_count = count_response.count if count_response.count else 0
        
        # Get subscriptions for all users
        user_ids = [user['id'] for user in users]
        subscriptions_response = supabase.table('user_subscriptions').select('*, subscription_plans(*)').in_('user_id', user_ids).execute()
        subscriptions_data = subscriptions_response.data if not subscriptions_response.error else []
        
        # Create subscription lookup
        subscriptions_lookup = {}
        for sub in subscriptions_data:
            subscriptions_lookup[sub['user_id']] = sub
        
        # Format user data
        formatted_users = []
        for user in users:
            subscription = subscriptions_lookup.get(user['id'], {})
            plan = subscription.get('subscription_plans', {}) if subscription else {}
            
            formatted_user = {
                'id': user['id'],
                'email': user['email'],
                'first_name': user.get('first_name', ''),
                'last_name': user.get('last_name', ''),
                'role': user.get('role', 'user'),
                'created_at': user['created_at'],
                'subscription_tier': plan.get('name', 'free'),
                'subscription_status': subscription.get('status', 'none'),
                'subscription_start': subscription.get('current_period_start'),
                'subscription_end': subscription.get('current_period_end'),
                'is_active': subscription.get('status') == 'active' and 
                            subscription.get('current_period_end') > datetime.utcnow().isoformat()
            }
            formatted_users.append(formatted_user)
        
        return jsonify({
            'status': 'success',
            'data': {
                'users': formatted_users,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_count,
                    'pages': (total_count + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting users: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/subscriptions/summary', methods=['GET'])
def get_subscription_summary():
    """Get subscription summary statistics."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Get subscription statistics
        now = datetime.utcnow().isoformat()
        
        # Try to get subscription data, handle missing tables gracefully
        try:
            # Active subscriptions
            active_response = supabase.table('user_subscriptions').select('*').eq('status', 'active').execute()
            active_subscriptions = active_response.data if not active_response.error else []
        except Exception as e:
            current_app.logger.warning(f"user_subscriptions table not found or error: {e}")
            active_subscriptions = []
        
        try:
            # Get payment transactions for revenue calculation
            payment_response = supabase.table('payment_transactions').select('*').eq('status', 'success').execute()
            payments = payment_response.data if not payment_response.error else []
        except Exception as e:
            current_app.logger.warning(f"payment_transactions table not found or error: {e}")
            payments = []
        
        # Calculate revenue from payments
        total_revenue = sum(float(payment.get('amount', 0)) for payment in payments)
        monthly_revenue = sum(float(payment.get('amount', 0)) for payment in payments 
                           if payment.get('created_at', '').startswith(now[:7]))  # Current month
        
        # Get total users
        try:
            users_response = supabase.table('profiles').select('id', count='exact').execute()
            total_users = users_response.count if users_response.count else 0
        except Exception as e:
            current_app.logger.warning(f"Error getting user count: {e}")
            total_users = 0
        
        # Calculate trial users (users without active subscriptions)
        trial_users = max(0, total_users - len(active_subscriptions))
        
        summary = {
            'total_active': len(active_subscriptions),
            'total_trials': trial_users,
            'total_cancelled': 0,  # Placeholder
            'total_revenue': total_revenue,
            'monthly_revenue': monthly_revenue,
            'subscriptions': []  # Will be populated if needed
        }
        
        return jsonify({
            'status': 'success',
            'data': summary
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting subscription summary: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/subscriptions/export', methods=['GET'])
def export_subscriptions():
    """Export subscription data to CSV."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Get all subscriptions with user and plan data
        response = supabase.table('user_subscriptions').select('''
            *,
            profiles(*),
            subscription_plans(*)
        ''').execute()
        
        if response.error:
            current_app.logger.error(f"Database error: {response.error}")
            return jsonify({'status': 'error', 'message': 'Database query failed'}), 500
        
        subscriptions = response.data
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'User ID', 'Email', 'First Name', 'Last Name',
            'Plan Name', 'Status', 'Start Date', 'End Date',
            'Monthly Price', 'Created At'
        ])
        
        # Write data
        for sub in subscriptions:
            profile = sub.get('profiles', {})
            plan = sub.get('subscription_plans', {})
            
            writer.writerow([
                sub.get('user_id', ''),
                profile.get('email', ''),
                profile.get('first_name', ''),
                profile.get('last_name', ''),
                plan.get('name', ''),
                sub.get('status', ''),
                sub.get('current_period_start', ''),
                sub.get('current_period_end', ''),
                plan.get('price_monthly', 0),
                sub.get('created_at', '')
            ])
        
        # Prepare response
        output.seek(0)
        csv_data = output.getvalue()
        
        from flask import Response
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=subscriptions.csv'}
        )
        
    except Exception as e:
        current_app.logger.error(f"Error exporting subscriptions: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/metrics/revenue', methods=['GET'])
def get_revenue_metrics():
    """Get revenue metrics over time."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Get time period from query params
        period = request.args.get('period', 'monthly')  # daily, weekly, monthly
        days = request.args.get('days', 30, type=int)
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Try to get payment transactions, handle missing tables gracefully
        try:
            response = supabase.table('payment_transactions').select('*').gte('created_at', start_date.isoformat()).lte('created_at', end_date.isoformat()).execute()
            transactions = response.data if not response.error else []
        except Exception as e:
            current_app.logger.warning(f"payment_transactions table not found or error: {e}")
            transactions = []
        
        # Group by period
        revenue_data = {}
        for transaction in transactions:
            if transaction.get('status') == 'success':
                date = datetime.fromisoformat(transaction['created_at'].replace('Z', '+00:00'))
                
                if period == 'daily':
                    key = date.strftime('%Y-%m-%d')
                elif period == 'weekly':
                    key = date.strftime('%Y-W%W')
                else:  # monthly
                    key = date.strftime('%Y-%m')
                
                if key not in revenue_data:
                    revenue_data[key] = 0
                revenue_data[key] += float(transaction.get('amount', 0))
        
        # Convert to sorted list
        revenue_list = [{'period': k, 'revenue': v} for k, v in revenue_data.items()]
        revenue_list.sort(key=lambda x: x['period'])
        
        # Calculate monthly growth if we have enough data
        monthly_growth = 0
        if len(revenue_list) >= 2 and period == 'monthly':
            current_month = revenue_list[-1]['revenue'] if revenue_list else 0
            previous_month = revenue_list[-2]['revenue'] if len(revenue_list) > 1 else 0
            if previous_month > 0:
                monthly_growth = ((current_month - previous_month) / previous_month) * 100
        
        return jsonify({
            'status': 'success',
            'data': {
                'period': period,
                'revenue_data': revenue_list,
                'total_revenue': sum(revenue_data.values()),
                'monthly_growth': monthly_growth
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting revenue metrics: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/metrics/usage', methods=['GET'])
def get_usage_metrics():
    """Get feature usage metrics."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Get time period from query params
        days = request.args.get('days', 30, type=int)
        start_date = (datetime.utcnow() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Try to get usage data, handle missing tables gracefully
        try:
            response = supabase.table('usage_tracking').select('*').gte('usage_date', start_date).execute()
            usage_data = response.data if not response.error else []
        except Exception as e:
            current_app.logger.warning(f"usage_tracking table not found or error: {e}")
            usage_data = []
        
        # Try to get detection history for usage metrics
        try:
            detection_response = supabase.table('detection_history').select('*').gte('created_at', start_date).execute()
            detections = detection_response.data if not detection_response.error else []
        except Exception as e:
            current_app.logger.warning(f"detection_history table not found or error: {e}")
            detections = []
        
        # Try to get meal plans for usage metrics
        try:
            meal_plans_response = supabase.table('meal_plans').select('*').gte('created_at', start_date).execute()
            meal_plans = meal_plans_response.data if not meal_plans_response.error else []
        except Exception as e:
            current_app.logger.warning(f"meal_plans table not found or error: {e}")
            meal_plans = []
        
        # Calculate feature usage from available data
        feature_usage = {
            'food_detection': len(detections),
            'meal_planning': len(meal_plans),
            'nutrition_analysis': len(detections)  # Assume same as detections
        }
        
        # Add usage tracking data if available
        for usage in usage_data:
            feature = usage.get('feature_name', 'unknown')
            if feature not in feature_usage:
                feature_usage[feature] = 0
            feature_usage[feature] += usage.get('usage_count', 0)
        
        # Get unique users from all data sources
        unique_users = set()
        for detection in detections:
            if detection.get('user_id'):
                unique_users.add(detection['user_id'])
        for meal_plan in meal_plans:
            if meal_plan.get('user_id'):
                unique_users.add(meal_plan['user_id'])
        for usage in usage_data:
            if usage.get('user_id'):
                unique_users.add(usage['user_id'])
        
        # Generate daily usage data for the last 7 days
        daily_usage = []
        for i in range(7):
            date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            day_detections = len([d for d in detections if d.get('created_at', '').startswith(date)])
            day_meal_plans = len([m for m in meal_plans if m.get('created_at', '').startswith(date)])
            day_users = len(set(
                [d.get('user_id') for d in detections if d.get('created_at', '').startswith(date) and d.get('user_id')] +
                [m.get('user_id') for m in meal_plans if m.get('created_at', '').startswith(date) and m.get('user_id')]
            ))
            
            daily_usage.append({
                'date': date,
                'detections': day_detections,
                'meal_plans': day_meal_plans,
                'users': day_users
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'total_detections': len(detections),
                'total_meal_plans': len(meal_plans),
                'active_users_today': len([u for u in unique_users if any(
                    d.get('created_at', '').startswith(datetime.utcnow().strftime('%Y-%m-%d')) 
                    for d in detections if d.get('user_id') == u
                )]),
                'active_users_week': len(unique_users),
                'feature_usage': feature_usage,
                'daily_usage': daily_usage
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting usage metrics: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/users/<user_id>/details', methods=['GET'])
def get_user_details(user_id):
    """Get detailed information about a specific user."""
    try:
        # Verify admin access
        admin_user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Get user profile
        profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        if profile_response.error or not profile_response.data:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        profile = profile_response.data[0]
        
        # Get user subscription
        subscription_response = supabase.table('user_subscriptions').select('*, subscription_plans(*)').eq('user_id', user_id).execute()
        subscription = subscription_response.data[0] if subscription_response.data else None
        
        # Get detection history
        detection_response = supabase.table('detection_history').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(50).execute()
        detection_history = detection_response.data if not detection_response.error else []
        
        # Get meal plans
        meal_plans_response = supabase.table('meal_plans').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(20).execute()
        meal_plans = meal_plans_response.data if not meal_plans_response.error else []
        
        # Get usage tracking
        usage_response = supabase.table('usage_tracking').select('*').eq('user_id', user_id).order('usage_date', desc=True).limit(100).execute()
        usage_tracking = usage_response.data if not usage_response.error else []
        
        user_details = {
            'profile': profile,
            'subscription': subscription,
            'detection_history': detection_history,
            'meal_plans': meal_plans,
            'usage_tracking': usage_tracking
        }
        
        return jsonify({
            'status': 'success',
            'data': user_details
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting user details: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/subscriptions/<subscription_id>/update', methods=['PUT'])
def update_subscription(subscription_id):
    """Update a user's subscription (admin only)."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['status']
        for field in required_fields:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Missing required field: {field}'}), 400
        
        # Update subscription
        update_data = {
            'status': data['status'],
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Add optional fields if provided
        if 'current_period_end' in data:
            update_data['current_period_end'] = data['current_period_end']
        if 'cancel_at_period_end' in data:
            update_data['cancel_at_period_end'] = data['cancel_at_period_end']
        
        response = supabase.table('user_subscriptions').update(update_data).eq('id', subscription_id).execute()
        
        if response.error:
            current_app.logger.error(f"Database error: {response.error}")
            return jsonify({'status': 'error', 'message': 'Failed to update subscription'}), 500
        
        if not response.data:
            return jsonify({'status': 'error', 'message': 'Subscription not found'}), 404
        
        return jsonify({
            'status': 'success',
            'message': 'Subscription updated successfully',
            'data': response.data[0]
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating subscription: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


@admin_bp.route('/subscriptions/<subscription_id>/cancel', methods=['POST'])
def cancel_subscription(subscription_id):
    """Cancel a user's subscription (admin only)."""
    try:
        # Verify admin access
        user_id, error = verify_admin_access()
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
        
        # Cancel subscription
        update_data = {
            'status': 'cancelled',
            'cancel_at_period_end': True,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('user_subscriptions').update(update_data).eq('id', subscription_id).execute()
        
        if response.error:
            current_app.logger.error(f"Database error: {response.error}")
            return jsonify({'status': 'error', 'message': 'Failed to cancel subscription'}), 500
        
        if not response.data:
            return jsonify({'status': 'error', 'message': 'Subscription not found'}), 404
        
        return jsonify({
            'status': 'success',
            'message': 'Subscription cancelled successfully',
            'data': response.data[0]
        })
        
    except Exception as e:
        current_app.logger.error(f"Error cancelling subscription: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500 