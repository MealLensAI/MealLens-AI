from flask import Blueprint, jsonify
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'MealLens Backend API',
        'version': '1.0.0'
    }), 200

@health_bp.route('/api/health', methods=['GET'])
def api_health_check():
    """API health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'MealLens Backend API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'payment': '/api/payment',
            'food_detection': '/api/food-detection',
            'meal_planner': '/api/meal-planner'
        }
    }), 200 