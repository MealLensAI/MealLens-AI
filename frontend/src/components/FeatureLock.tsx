import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Clock, Zap } from 'lucide-react';

interface FeatureLockProps {
  featureName: string;
  featureTitle: string;
  featureDescription: string;
  icon?: React.ReactNode;
  className?: string;
}

const FeatureLock: React.FC<FeatureLockProps> = ({
  featureName,
  featureTitle,
  featureDescription,
  icon,
  className = ''
}) => {
  const { isFeatureLocked, isInTrial, getTrialDaysLeft, subscription } = useSubscription();
  const navigate = useNavigate();

  const isLocked = isFeatureLocked(featureName);
  const inTrial = isInTrial();
  const trialDaysLeft = getTrialDaysLeft();
  const hasActiveSubscription = subscription?.subscription?.status === 'active';

  if (!isLocked) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/payment');
  };

  const getStatusInfo = () => {
    if (hasActiveSubscription) {
      return {
        title: 'Subscription Active',
        description: 'You have access to all features',
        icon: <Crown className="h-5 w-5 text-yellow-500" />,
        color: 'text-[#FF6B6B]',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    if (inTrial) {
      return {
        title: `Free Trial - ${trialDaysLeft} days left`,
        description: 'Upgrade to continue using premium features',
        icon: <Clock className="h-5 w-5 text-orange-500" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }

    return {
      title: 'Premium Feature',
      description: 'Subscribe to unlock this feature',
      icon: <Lock className="h-5 w-5 text-gray-500" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`w-full ${className}`}>
      <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-white shadow-sm">
              {icon || statusInfo.icon}
            </div>
          </div>
          <CardTitle className={`text-xl font-semibold ${statusInfo.color}`}>
            {featureTitle}
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {featureDescription}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className={`font-medium ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-sm text-gray-600">
              {statusInfo.description}
            </p>
          </div>

          {inTrial && (
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-orange-700 font-medium">
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining in trial
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
                              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#FF5252] hover:to-[#FF6B6B] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Crown className="h-4 w-4 mr-2" />
              {inTrial ? 'Upgrade Now' : 'Subscribe to Unlock'}
            </Button>
            
            {inTrial && (
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => navigate('/settings')}
              >
                View Subscription Details
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Zap className="h-3 w-3" />
              <span>Premium features require active subscription</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureLock; 