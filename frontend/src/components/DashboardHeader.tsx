import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Clock, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import DashboardNavigation from './DashboardNavigation';
import Logo from './Logo';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className = '' }) => {
  const { user } = useAuth();
  
  // Safely use subscription context with error handling
  let subscriptionContext = null;
  let subscription = null;
  let isInTrial = () => false;
  let getTrialDaysLeft = () => 0;
  let getDaysUntilExpiry = () => 0;
  let isSubscriptionExpired = () => false;
  let getPlanDisplayName = (plan: string) => plan;
  let getDaysUntilFreeTierReset = () => 30;
  
  try {
    subscriptionContext = useSubscription();
    if (subscriptionContext) {
      subscription = subscriptionContext.subscription;
      isInTrial = subscriptionContext.isInTrial || (() => false);
      getTrialDaysLeft = subscriptionContext.getTrialDaysLeft || (() => 0);
      getDaysUntilExpiry = subscriptionContext.getDaysUntilExpiry || (() => 0);
      isSubscriptionExpired = subscriptionContext.isSubscriptionExpired || (() => false);
      getPlanDisplayName = subscriptionContext.getPlanDisplayName || ((plan: string) => plan);
      getDaysUntilFreeTierReset = subscriptionContext.getDaysUntilFreeTierReset || (() => 30);
    }
  } catch (error) {
    console.warn('Subscription context not available:', error);
  }

  const getSubscriptionStatus = () => {
    if (subscription?.plan?.name === 'free') {
      if (isInTrial()) {
        return {
          type: 'trial',
          message: `${getTrialDaysLeft()} days left in trial`,
          icon: Clock,
          color: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      } else {
        return {
          type: 'free',
          message: `Resets in ${getDaysUntilFreeTierReset()} days`,
          icon: Calendar,
          color: 'bg-gray-100 text-gray-700 border-gray-200'
        };
      }
    } else {
      if (isSubscriptionExpired()) {
        return {
          type: 'expired',
          message: 'Subscription expired',
          icon: AlertCircle,
          color: 'bg-red-100 text-red-700 border-red-200'
        };
      } else {
        return {
          type: 'active',
          message: `${getDaysUntilExpiry()} days remaining`,
          icon: TrendingUp,
          color: 'bg-green-100 text-green-700 border-green-200'
        };
      }
    }
  };

  const status = getSubscriptionStatus();
  const StatusIcon = status.icon;

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Logo size="lg" showText={false} variant="nav" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <DashboardNavigation />
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Subscription Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <Badge className={`${status.color} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {getPlanDisplayName(subscription?.plan?.name || 'free')}
              </Badge>
              <span className="text-xs text-gray-500">
                {status.message}
              </span>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <DashboardNavigation />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 