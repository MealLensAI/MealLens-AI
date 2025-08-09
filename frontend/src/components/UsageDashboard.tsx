import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface UsageInfo {
  can_use: boolean;
  current_usage: number;
  limit: number;
  remaining: number;
  message?: string;
}

interface SubscriptionInfo {
  subscription: any;
  plan: any;
  usage: any;
}

const UsageDashboard: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usageData, setUsageData] = useState<Record<string, UsageInfo>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsageData = async () => {
      try {
        setLoading(true);
        
        // Load subscription info
        const subResponse = await api.get('/payment/subscription');
        if (subResponse.status === 'success') {
          setSubscription(subResponse.subscription);
        }

        // Load usage for each feature
        const features = ['food_detection', 'ingredient_detection', 'meal_planning'];
        const usagePromises = features.map(async (feature) => {
          try {
            const response = await api.get(`/payment/check-usage/${feature}`);
            if (response.status === 'success') {
              return { feature, data: response };
            }
          } catch (error) {
            console.error(`Error loading usage for ${feature}:`, error);
          }
          return { feature, data: null };
        });

        const usageResults = await Promise.all(usagePromises);
        const usageMap: Record<string, UsageInfo> = {};
        
        usageResults.forEach(({ feature, data }) => {
          if (data) {
            usageMap[feature] = {
              can_use: data.can_use,
              current_usage: data.current_usage,
              limit: data.limit,
              remaining: data.remaining,
              message: data.message
            };
          }
        });

        setUsageData(usageMap);
      } catch (error) {
        console.error('Error loading usage data:', error);
        toast({
          title: "Error",
          description: "Failed to load usage data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsageData();
  }, [toast]);

  const getFeatureDisplayName = (feature: string) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (current: number, limit: number) => {
    if (limit === -1) return 'bg-green-500'; // Unlimited
    const percentage = getUsagePercentage(current, limit);
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Usage Dashboard...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {subscription.plan?.display_name || 'Free Plan'}
                </h3>
                <p className="text-gray-600">
                  {subscription.subscription?.status === 'active' ? 'Active' : 'Inactive'}
                </p>
                {subscription.subscription?.current_period_end && (
                  <p className="text-sm text-gray-500">
                    Renews on {new Date(subscription.subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-sm">
                  {subscription.plan?.name?.toUpperCase() || 'FREE'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(usageData).map(([feature, usage]) => (
              <div key={feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {getFeatureDisplayName(feature)}
                    </span>
                    {usage.can_use ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {usage.current_usage} / {usage.limit === -1 ? '∞' : usage.limit}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={getUsagePercentage(usage.current_usage, usage.limit)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {usage.remaining === -1 ? 'Unlimited' : `${usage.remaining} remaining`}
                    </span>
                    {!usage.can_use && (
                      <span className="text-red-600 font-medium">
                        {usage.message || 'Limit exceeded'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {Object.values(usageData).some(usage => !usage.can_use) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Usage Limits Reached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              You've reached your usage limits for some features. Consider upgrading your plan to continue using all features.
            </p>
            <a
              href="/payment"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Upgrade Plan
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsageDashboard; 