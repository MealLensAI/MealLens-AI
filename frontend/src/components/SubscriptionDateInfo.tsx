import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SubscriptionDateInfo: React.FC = () => {
  const { 
    subscription, 
    getSubscriptionStartDate, 
    getSubscriptionEndDate, 
    getDaysUntilExpiry, 
    isSubscriptionExpired 
  } = useSubscription();

  if (!subscription) {
    return null;
  }

  const startDate = getSubscriptionStartDate();
  const endDate = getSubscriptionEndDate();
  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpired = isSubscriptionExpired();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Subscription Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activation Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Activated</span>
          </div>
          <span className="text-sm text-gray-600">
            {startDate ? startDate.toLocaleDateString() : 'N/A'}
          </span>
        </div>

        {/* Expiry Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Expires</span>
          </div>
          <span className="text-sm text-gray-600">
            {endDate ? endDate.toLocaleDateString() : 'N/A'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Status</span>
          <Badge 
            variant={isExpired ? "destructive" : daysUntilExpiry <= 7 ? "secondary" : "default"}
            className="flex items-center gap-1"
          >
            {isExpired ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                Expired
              </>
            ) : daysUntilExpiry <= 7 ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                Expires Soon ({daysUntilExpiry} days)
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Active ({daysUntilExpiry} days left)
              </>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDateInfo; 