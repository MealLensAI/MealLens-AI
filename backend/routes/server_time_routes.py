from flask import Blueprint, jsonify
from datetime import datetime
import pytz

server_time_routes = Blueprint('server_time', __name__)

@server_time_routes.route('/server-time', methods=['GET'])
def get_server_time():
    """
    Get the current server time to prevent client-side clock manipulation
    """
    try:
        # Get current UTC time
        utc_time = datetime.utcnow()
        
        # Convert to a specific timezone (e.g., UTC)
        utc_tz = pytz.UTC
        server_time = utc_tz.localize(utc_time)
        
        return jsonify({
            'status': 'success',
            'serverTime': server_time.isoformat(),
            'timezone': 'UTC',
            'timestamp': server_time.timestamp()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to get server time',
            'error': str(e)
        }), 500 