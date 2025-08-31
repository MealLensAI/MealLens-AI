import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, TrendingUp, Users, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface UsageMetrics {
  total_detections: number;
  total_meal_plans: number;
  active_users_today: number;
  active_users_week: number;
  feature_usage: {
    food_detection: number;
    meal_planning: number;
    nutrition_analysis: number;
  };
  daily_usage: Array<{
    date: string;
    detections: number;
    meal_plans: number;
    users: number;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminUsageMetrics();
      
      if (response.status === 'success') {
        setData(response.data);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to fetch analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">View detailed analytics and insights</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAnalyticsData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.total_detections.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All time food detections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meal Plans Created</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.total_meal_plans.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All time meal plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.active_users_today}</div>
                <p className="text-xs text-muted-foreground">
                  Users active today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.active_users_week}</div>
                <p className="text-xs text-muted-foreground">
                  Users active this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>
                Usage statistics for different features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Food Detection</h3>
                    <p className="text-sm text-gray-500">Image analysis requests</p>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {data.feature_usage.food_detection.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Meal Planning</h3>
                    <p className="text-sm text-gray-500">Meal plan generations</p>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {data.feature_usage.meal_planning.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Nutrition Analysis</h3>
                    <p className="text-sm text-gray-500">Nutrition calculations</p>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {data.feature_usage.nutrition_analysis.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trends</CardTitle>
              <CardDescription>
                Usage patterns over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.daily_usage?.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {day.users} active users
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{day.detections}</p>
                        <p className="text-xs text-gray-500">Detections</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{day.meal_plans}</p>
                        <p className="text-xs text-gray-500">Meal Plans</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics; 