import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Logo from '@/components/Logo';
import {
  Home, 
  Camera, 
  ChefHat, 
  Calendar, 
  History, 
  User, 
  Settings, 
  Crown,
  Menu,
  X,
  LogOut,
  ChevronDown,
  CreditCard
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { subscription, isInTrial, getTrialDaysLeft } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/login';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { path: '/ai-kitchen', label: 'Home', icon: Home },
    { path: '/detect-food', label: 'Detect Food', icon: Camera },
    { path: '/meal-planner', label: 'Meal Planner', icon: Calendar },
    { path: '/history', label: 'History', icon: History },
  ];

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/ai-kitchen">
              <Logo size="md" />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActiveRoute(item.path)
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu and Subscription */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Subscription Status */}
            {subscription?.plan?.name !== 'free' && (
              <Badge variant="default" className="bg-orange-500 text-white text-xs">
                <Crown className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{subscription?.plan?.display_name}</span>
              </Badge>
            )}
            {isInTrial && (
              <Badge variant="secondary" className="text-orange-700 bg-orange-100 text-xs">
                <span className="hidden sm:inline">Trial - {getTrialDaysLeft()} days left</span>
                <span className="sm:hidden">Trial</span>
              </Badge>
            )}

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
            <Button
                onClick={toggleUserDropdown}
              variant="ghost"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <span className="hidden sm:inline text-gray-700">{user.displayName || user.email}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={closeUserDropdown}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={closeUserDropdown}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <Link
                    to="/payment"
                    onClick={closeUserDropdown}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
                  </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/ai-kitchen">
            <Logo size="md" />
          </Link>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* Subscription Badge */}
            {subscription?.plan?.name !== 'free' && (
              <Badge variant="default" className="bg-orange-500 text-white text-xs">
                <Crown className="h-3 w-3" />
              </Badge>
            )}
            {isInTrial && (
              <Badge variant="secondary" className="text-orange-700 bg-orange-100 text-xs">
                Trial
              </Badge>
            )}

            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            {/* Navigation Links */}
            <div className="py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActiveRoute(item.path)
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
      </div>

            {/* User Actions */}
            <div className="border-t border-gray-100 py-2">
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              
              <Link
                to="/settings"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              
              <Link
                to="/payment"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>Subscription</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
