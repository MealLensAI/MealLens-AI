import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface FeatureBlurProps {
  children: React.ReactNode;
  featureName: string;
  featureTitle: string;
  featureDescription: string;
  showUpgradeButton?: boolean;
  className?: string;
}

const FeatureBlur: React.FC<FeatureBlurProps> = ({
  children,
  featureName,
  featureTitle,
  featureDescription,
  showUpgradeButton = true,
  className = ''
}) => {
  const { isFeatureLocked } = useSubscription();
  const navigate = useNavigate();
  const isLocked = isFeatureLocked(featureName);

  if (!isLocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred Content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
        <Card className="w-full max-w-sm mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{featureTitle}</h3>
              <p className="text-sm text-gray-600">{featureDescription}</p>
            </div>
            
            {showUpgradeButton && (
              <Button
                onClick={() => navigate('/payment')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Access
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureBlur; 