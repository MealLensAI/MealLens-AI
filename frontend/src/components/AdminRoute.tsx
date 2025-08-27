import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/utils';
import LoadingScreen from './LoadingScreen';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        navigate('/login');
        return;
      }

      if (user && user.role !== 'admin') {
        // User is authenticated but not admin, redirect to main app
        navigate('/ai-kitchen');
        return;
      }
    }
  }, [user, loading, isAuthenticated, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If user is not admin, don't render anything (will redirect)
  if (user && user.role !== 'admin') {
    return null;
  }

  // User is authenticated and is admin, render the admin content
  return <>{children}</>;
};

export default AdminRoute; 