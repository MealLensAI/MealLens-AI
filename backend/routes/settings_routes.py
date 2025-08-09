from flask import Blueprint, request, jsonify, current_app

settings_bp = Blueprint('settings', __name__)

def get_user_id_from_token():
    """Extract user ID from token with proper error handling"""
    try:
        auth_service = current_app.auth_service
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None, "No Authorization header provided"
        
        user_id, auth_type = auth_service.get_supabase_user_id_from_token(auth_header)
        
        if not user_id:
            return None, f"Token verification failed. Auth type attempted: {auth_type}"
        
        return user_id, None
    except Exception as e:
        current_app.logger.error(f"Error extracting user ID from token: {str(e)}")
        return None, f"Token processing error: {str(e)}"

@settings_bp.route('/settings/sickness', methods=['GET'])
def get_sickness_settings():
    """
    Get sickness settings for the current user.
    DEPRECATED: Sickness settings are now handled in the profile system.
    """
    return jsonify({
        'status': 'deprecated',
        'message': 'Sickness settings are now managed in the profile. Please use /api/profile instead.'
    }), 200

@settings_bp.route('/settings/sickness', methods=['POST'])
def save_sickness_settings():
    """
    Save sickness settings for the current user.
    DEPRECATED: Sickness settings are now handled in the profile system.
    """
    return jsonify({
        'status': 'deprecated',
        'message': 'Sickness settings are now managed in the profile. Please use /api/profile instead.'
    }), 200