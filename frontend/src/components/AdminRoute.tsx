import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/utils';
import LoadingScreen from './LoadingScreen';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    // Check localStorage directly for admin role and authentication
    const storedToken = localStorage.getItem('access_token');
    const storedUserData = localStorage.getItem('user_data');
    let storedRole = 'user';
    let hasValidToken = false;
    
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        storedRole = parsedUser.role || 'user';
        hasValidToken = !!storedToken;
      } catch (e) {
        console.error('[ADMIN ROUTE] Error parsing stored user data:', e);
      }
    }
    
    // If we have a valid token and admin role in localStorage, allow access immediately
    if (hasValidToken && storedRole === 'admin') {
      setRoleChecked(true);
      return;
    }
    
    if (!loading) {
      if (!isAuthenticated && !hasValidToken) {
        // Not authenticated, redirect to admin login
        navigate('/admin-login');
        return;
      }

      // Check if user has admin role (check both user object and localStorage)
      const userRole = user?.role || storedRole || 'user';
      
      if (userRole !== 'admin') {
        // User is authenticated but not admin, redirect to main app
        navigate('/ai-kitchen');
        return;
      }
      
      // User is admin, allow access
      setRoleChecked(true);
    }
  }, [user, loading, isAuthenticated, navigate]);

  // Show loading while checking authentication or role
  if (loading || !roleChecked) {
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