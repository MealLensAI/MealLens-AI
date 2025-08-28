from flask import Blueprint, jsonify
from services.supabase_service import SupabaseService
import os

public_bp = Blueprint('public', __name__)

def get_supabase_service():
    """Get Supabase service instance."""
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_service_role_key:
        return None
    
    return SupabaseService(supabase_url, supabase_service_role_key)

@public_bp.route('/user-count', methods=['GET'])
def get_user_count():
    """Get total user count from database."""
    try:
        supabase_service = get_supabase_service()
        if not supabase_service:
            return jsonify({
                'status': 'error',
                'message': 'Database service not available'
            }), 500
        
        # Count users in the profiles table
        result = supabase_service.supabase.table('profiles').select('id', count='exact').execute()
        
        user_count = result.count if result.count is not None else 1000
        
        return jsonify({
            'status': 'success',
            'user_count': user_count
        }), 200
        
    except Exception as e:
        print(f"Error fetching user count: {str(e)}")
        # Return fallback count on error
        return jsonify({
            'status': 'success',
            'user_count': 1000
        }), 200 