import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Camera, 
  ChefHat, 
  Calendar, 
  User, 
  Settings, 
  CreditCard, 
  LogOut,
  Menu,
  X,
  History,
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface DashboardNavigationProps {
  className?: string;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscription, getPlanDisplayName } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const navigationItems = [
    { name: 'Home', path: '/ai-kitchen', icon: Home },
    { name: 'Detect Food', path: '/detect-food', icon: Camera },
    { name: 'Meal Planner', path: '/meal-planner', icon: Calendar },
    { name: 'History', path: '/history', icon: History },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden lg:flex items-center space-x-1 ${className}`}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              className={`px-4 py-2 text-sm font-medium ${
                isActive(item.path) 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user?.displayName || 'User'}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
              <p className="text-xs text-orange-600 font-medium">
                {getPlanDisplayName(subscription?.plan?.name || 'free')}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/payment')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </DropdownMenuItem>


          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive(item.path) 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
            <DropdownMenuSeparator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700"
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }}
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700"
              onClick={() => {
                navigate('/settings');
                setIsMobileMenuOpen(false);
              }}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700"
              onClick={() => {
                navigate('/payment');
                setIsMobileMenuOpen(false);
              }}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              Subscription
            </Button>
            <DropdownMenuSeparator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNavigation; 