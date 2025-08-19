import os
import time
import threading
from typing import Optional, Dict, Any
from contextlib import contextmanager
from supabase import create_client, Client
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class DatabaseConnectionPool:
    """
    Connection pool for managing Supabase database connections efficiently.
    Handles connection reuse, timeout management, and error recovery.
    """
    
    def __init__(self, max_connections: int = 20, connection_timeout: int = 30):
        self.max_connections = max_connections
        self.connection_timeout = connection_timeout
        self._connections: Dict[int, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._connection_count = 0
        
    def get_connection(self) -> Client:
        """Get a database connection from the pool or create a new one."""
        thread_id = threading.get_ident()
        
        with self._lock:
            # Check if we have an existing connection for this thread
            if thread_id in self._connections:
                conn_info = self._connections[thread_id]
                
                # Check if connection is still valid (not expired)
                if time.time() - conn_info['created_at'] < self.connection_timeout:
                    return conn_info['client']
                else:
                    # Remove expired connection
                    del self._connections[thread_id]
                    self._connection_count -= 1
            
            # Create new connection if under limit
            if self._connection_count < self.max_connections:
                try:
                    supabase_url = os.environ.get("SUPABASE_URL")
                    supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
                    
                    if not supabase_url or not supabase_service_role_key:
                        raise ValueError("Missing Supabase credentials")
                    
                    client = create_client(supabase_url, supabase_service_role_key)
                    
                    # Store connection info
                    self._connections[thread_id] = {
                        'client': client,
                        'created_at': time.time(),
                        'last_used': time.time()
                    }
                    self._connection_count += 1
                    
                    logger.info(f"Created new database connection. Pool size: {self._connection_count}")
                    return client
                    
                except Exception as e:
                    logger.error(f"Failed to create database connection: {e}")
                    raise
            else:
                # Wait for a connection to become available
                logger.warning("Connection pool is full, waiting for available connection...")
                raise Exception("Database connection pool is full. Please try again later.")
    
    def release_connection(self, thread_id: Optional[int] = None):
        """Release a database connection back to the pool."""
        if thread_id is None:
            thread_id = threading.get_ident()
            
        with self._lock:
            if thread_id in self._connections:
                del self._connections[thread_id]
                self._connection_count -= 1
                logger.debug(f"Released database connection. Pool size: {self._connection_count}")
    
    def cleanup_expired_connections(self):
        """Remove expired connections from the pool."""
        current_time = time.time()
        
        with self._lock:
            expired_threads = []
            for thread_id, conn_info in self._connections.items():
                if current_time - conn_info['created_at'] > self.connection_timeout:
                    expired_threads.append(thread_id)
            
            for thread_id in expired_threads:
                del self._connections[thread_id]
                self._connection_count -= 1
            
            if expired_threads:
                logger.info(f"Cleaned up {len(expired_threads)} expired connections")
    
    def get_pool_status(self) -> Dict[str, Any]:
        """Get current pool status for monitoring."""
        with self._lock:
            return {
                'active_connections': self._connection_count,
                'max_connections': self.max_connections,
                'available_connections': self.max_connections - self._connection_count,
                'utilization_percent': (self._connection_count / self.max_connections) * 100
            }

# Global connection pool instance
_connection_pool: Optional[DatabaseConnectionPool] = None

def get_connection_pool() -> DatabaseConnectionPool:
    """Get the global connection pool instance."""
    global _connection_pool
    if _connection_pool is None:
        max_connections = int(os.environ.get("DB_MAX_CONNECTIONS", "20"))
        connection_timeout = int(os.environ.get("DB_CONNECTION_TIMEOUT", "30"))
        _connection_pool = DatabaseConnectionPool(max_connections, connection_timeout)
    return _connection_pool

@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Automatically handles connection acquisition and release.
    """
    pool = get_connection_pool()
    thread_id = threading.get_ident()
    
    try:
        connection = pool.get_connection()
        yield connection
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        # Don't release immediately, let the pool manage connection reuse
        pass

def initialize_database_pool():
    """Initialize the database connection pool."""
    try:
        pool = get_connection_pool()
        logger.info("Database connection pool initialized successfully")
        return pool
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {e}")
        raise

def cleanup_database_pool():
    """Clean up the database connection pool."""
    global _connection_pool
    if _connection_pool:
        _connection_pool.cleanup_expired_connections()
        logger.info("Database connection pool cleaned up")

# Health check function
def check_database_health() -> Dict[str, Any]:
    """Check database connectivity and pool health."""
    try:
        pool = get_connection_pool()
        pool_status = pool.get_pool_status()
        
        # Test connection
        with get_db_connection() as conn:
            # Simple query to test connectivity
            result = conn.table('profiles').select('id').limit(1).execute()
            
        return {
            'status': 'healthy',
            'pool_status': pool_status,
            'connection_test': 'success'
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            'status': 'unhealthy',
            'error': str(e),
            'pool_status': pool.get_pool_status() if pool else None
        }
