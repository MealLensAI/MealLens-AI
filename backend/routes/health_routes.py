from flask import Blueprint, jsonify, current_app
from datetime import datetime
import psutil
import os
from database import check_database_health, get_connection_pool

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Comprehensive health check endpoint for monitoring system status.
    Returns database connectivity, connection pool status, and system metrics.
    """
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database health check
        db_health = check_database_health()
        
        # Connection pool status
        pool = get_connection_pool()
        pool_status = pool.get_pool_status() if pool else None
        
        # Environment info
        env_info = {
            'python_version': os.sys.version,
            'environment': os.environ.get('FLASK_ENV', 'development'),
            'database_url': os.environ.get('SUPABASE_URL', 'not_set')[:20] + '...' if os.environ.get('SUPABASE_URL') else 'not_set'
        }
        
        # Overall health status
        overall_status = 'healthy'
        if db_health['status'] != 'healthy':
            overall_status = 'degraded'
        
        response = {
            'status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'system': {
                'cpu_percent': cpu_percent,
                'memory': {
                    'total_gb': round(memory.total / (1024**3), 2),
                    'available_gb': round(memory.available / (1024**3), 2),
                    'percent_used': memory.percent
                },
                'disk': {
                    'total_gb': round(disk.total / (1024**3), 2),
                    'free_gb': round(disk.free / (1024**3), 2),
                    'percent_used': round((disk.used / disk.total) * 100, 2)
                }
            },
            'database': db_health,
            'connection_pool': pool_status,
            'environment': env_info
        }
        
        status_code = 200 if overall_status == 'healthy' else 503
        return jsonify(response), status_code
        
    except Exception as e:
        current_app.logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503

@health_bp.route('/health/simple', methods=['GET'])
def simple_health_check():
    """
    Simple health check for load balancers and basic monitoring.
    Returns minimal response for quick status checks.
    """
    try:
        # Quick database connectivity test
        db_health = check_database_health()
        
        if db_health['status'] == 'healthy':
    return jsonify({
                'status': 'ok',
                'timestamp': datetime.utcnow().isoformat()
    }), 200
        else:
            return jsonify({
                'status': 'error',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'timestamp': datetime.utcnow().isoformat()
        }), 503

@health_bp.route('/health/database', methods=['GET'])
def database_health_check():
    """
    Database-specific health check endpoint.
    """
    try:
        db_health = check_database_health()
        status_code = 200 if db_health['status'] == 'healthy' else 503
        return jsonify(db_health), status_code
        
    except Exception as e:
        current_app.logger.error(f"Database health check failed: {str(e)}")
    return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503

@health_bp.route('/health/pool', methods=['GET'])
def pool_health_check():
    """
    Connection pool health check endpoint.
    """
    try:
        pool = get_connection_pool()
        pool_status = pool.get_pool_status()
        
        # Determine if pool is healthy
        is_healthy = (
            pool_status['active_connections'] <= pool_status['max_connections'] and
            pool_status['utilization_percent'] < 90  # Less than 90% utilization
        )
        
        response = {
            'status': 'healthy' if is_healthy else 'degraded',
            'pool_status': pool_status,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        status_code = 200 if is_healthy else 503
        return jsonify(response), status_code
        
    except Exception as e:
        current_app.logger.error(f"Pool health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503 