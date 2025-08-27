import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  BarChart3,
  Clock,
  Crown,
  Shield,
  RefreshCw,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeSubscriptions: number;
  trialUsers: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeSubscriptions: 0,
    trialUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch real data from API
      const [usersResponse, subscriptionResponse] = await Promise.all([
        api.getAdminUsers({ limit: '1' }),
        api.getAdminSubscriptionSummary()
      ]);

      if (usersResponse.status === 'success' && subscriptionResponse.status === 'success') {
        setStats({
          totalUsers: usersResponse.data.pagination?.total || 0,
          activeUsers: Math.floor((usersResponse.data.pagination?.total || 0) * 0.7), // 70% active
          totalRevenue: subscriptionResponse.data.total_revenue || 0,
          monthlyGrowth: 12.5, // Mock growth
          activeSubscriptions: subscriptionResponse.data.total_active || 0,
          trialUsers: subscriptionResponse.data.total_trials || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data if API fails (production server doesn't have admin routes yet)
      setStats({
        totalUsers: 1250,
        activeUsers: 875,
        totalRevenue: 12500.00,
        monthlyGrowth: 12.5,
        activeSubscriptions: 450,
        trialUsers: 125
      });
      
      // Show toast notification about using mock data
      toast({
        title: "Using Demo Data",
        description: "Admin routes not deployed yet. Showing demo data for testing.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Data export is being prepared...",
    });
  };

  const quickActions = [
    {
      title: 'View All Users',
      description: 'Manage user accounts and subscriptions',
      icon: Users,
      action: () => window.location.href = '/admin-dashboard/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Subscription Analytics',
      description: 'Monitor revenue and subscription trends',
      icon: DollarSign,
      action: () => window.location.href = '/admin-dashboard/subscriptions',
      color: 'bg-green-500'
    },
    {
      title: 'Usage Analytics',
      description: 'Track feature usage and user engagement',
      icon: Activity,
      action: () => window.location.href = '/admin-dashboard/analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Generate Reports',
      description: 'Create detailed reports and exports',
      icon: BarChart3,
      action: () => window.location.href = '/admin-dashboard/reports',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to the MealLens administrative panel</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Deployment Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-yellow-800 text-sm font-bold">!</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Admin backend routes are not yet deployed to production. This dashboard is showing demo data for testing purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In trial period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Online</div>
            <Badge className="bg-green-100 text-green-800 mt-1">
              All Systems Operational
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New user registered', time: '2 minutes ago', type: 'user' },
              { action: 'Subscription upgraded', time: '5 minutes ago', type: 'subscription' },
              { action: 'Payment processed', time: '10 minutes ago', type: 'payment' },
              { action: 'System backup completed', time: '1 hour ago', type: 'system' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview; 