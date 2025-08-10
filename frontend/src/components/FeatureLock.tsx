import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface FeatureLockProps {
  featureName: string;
  featureTitle: string;
  featureDescription: string;
  icon?: React.ReactNode;
  className?: string;
  onUpgrade?: () => void;
}

const FeatureLock: React.FC<FeatureLockProps> = ({
  featureName,
  featureTitle,
  featureDescription,
  icon,
  className = '',
  onUpgrade
}) => {
  const { isFeatureLocked, isInTrial, getTrialDaysLeft, subscription, freeUsageCount, maxFreeUsage } = useSubscription();
  const navigate = useNavigate();

  const isLocked = isFeatureLocked(featureName);
  const inTrial = isInTrial();
  const trialDaysLeft = getTrialDaysLeft();
  const hasActiveSubscription = subscription?.subscription?.status === 'active';
  const remainingFreeUses = maxFreeUsage - freeUsageCount;

  if (!isLocked) {
    return null;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/payment');
    }
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

    // Free usage limit reached
    if (freeUsageCount >= maxFreeUsage) {
      return {
        title: 'Free Usage Limit Reached',
        description: `You've used all ${maxFreeUsage} free uses. Upgrade to continue.`,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    // Still has free uses
    return {
      title: `Free Usage - ${remainingFreeUses} uses left`,
      description: `You have ${remainingFreeUses} free uses remaining`,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
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

          {/* Free usage progress bar */}
          {!hasActiveSubscription && !inTrial && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Free Uses: {freeUsageCount}/{maxFreeUsage}</span>
                <span>{Math.round((freeUsageCount / maxFreeUsage) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    freeUsageCount >= maxFreeUsage 
                      ? 'bg-red-500' 
                      : freeUsageCount >= maxFreeUsage * 0.8 
                      ? 'bg-orange-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((freeUsageCount / maxFreeUsage) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upgrade button */}
          {(!hasActiveSubscription || freeUsageCount >= maxFreeUsage) && (
            <div className="space-y-3">
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-semibold"
              >
                <Crown className="h-4 w-4 mr-2" />
                {hasActiveSubscription ? 'Manage Subscription' : 'Upgrade Now'}
              </Button>
              
              {!hasActiveSubscription && (
                <p className="text-xs text-gray-500">
                  Start with our free plan and upgrade when you need more features
                </p>
              )}
            </div>
          )}

          {/* Feature benefits */}
          <div className="bg-white/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900">What you'll get:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                Unlimited AI-powered food detection
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                Personalized recipe suggestions
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                Advanced meal planning tools
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                Priority customer support
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureLock; 