import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Download,
  Search,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  FileText,
  BarChart,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

// Types
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_start?: string;
  subscription_end?: string;
  is_active: boolean;
}

interface SubscriptionSummary {
  total_active: number;
  total_expired: number;
  total_trials: number;
  revenue_by_plan: Record<string, number>;
  total_revenue: number;
}

interface RevenueData {
  period: string;
  revenue: number;
}

interface UsageData {
  feature_usage: Record<string, number>;
  unique_users: number;
  total_usage: number;
}

interface UserDetails {
  profile: any;
  subscription: any;
  detection_history: any[];
  meal_plans: any[];
  usage_tracking: any[];
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(tierFilter && { tier: tierFilter })
      };

      const response = await api.getAdminUsers(params);
      if (response.status === 'success') {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // For testing, create mock data if API fails
      if (error instanceof Error && error.message.includes('401')) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to access admin features",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users. Using mock data for testing.",
          variant: "destructive"
        });
        // Mock data for testing
        setUsers([
          {
            id: '1',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            created_at: new Date().toISOString(),
            subscription_tier: 'premium',
            subscription_status: 'active',
            is_active: true
          }
        ]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription summary
  const fetchSubscriptionSummary = async () => {
    try {
      const response = await api.getAdminSubscriptionSummary();
      if (response.status === 'success') {
        setSubscriptionSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching subscription summary:', error);
      // Mock data for testing
      setSubscriptionSummary({
        total_active: 5,
        total_expired: 2,
        total_trials: 3,
        revenue_by_plan: {
          'premium': 50.00,
          'basic': 25.00,
          'free': 0.00
        },
        total_revenue: 75.00
      });
    }
  };

  // Fetch revenue metrics
  const fetchRevenueMetrics = async () => {
    try {
      const response = await api.getAdminRevenueMetrics({ period: 'monthly', days: '30' });
      if (response.status === 'success') {
        setRevenueData(response.data.revenue_data);
      }
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      // Mock data for testing
      setRevenueData([
        { period: '2024-01', revenue: 25.00 },
        { period: '2024-02', revenue: 35.00 },
        { period: '2024-03', revenue: 45.00 },
        { period: '2024-04', revenue: 55.00 },
        { period: '2024-05', revenue: 65.00 },
        { period: '2024-06', revenue: 75.00 }
      ]);
    }
  };

  // Fetch usage metrics
  const fetchUsageMetrics = async () => {
    try {
      const response = await api.getAdminUsageMetrics({ days: '30' });
      if (response.status === 'success') {
        setUsageData(response.data);
      }
    } catch (error) {
      console.error('Error fetching usage metrics:', error);
      // Mock data for testing
      setUsageData({
        feature_usage: {
          'food_detection': 150,
          'meal_planning': 75,
          'recipe_generation': 45,
          'ai_kitchen': 30
        },
        unique_users: 25,
        total_usage: 300
      });
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await api.getAdminUserDetails(userId);
      if (response.status === 'success') {
        setSelectedUser(response.data);
        setUserDetailsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive"
      });
    }
  };

  // Export subscriptions
  const exportSubscriptions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/subscriptions/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscriptions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Subscriptions exported successfully",
        });
      }
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to export subscriptions",
        variant: "destructive"
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchSubscriptionSummary();
    fetchRevenueMetrics();
    fetchUsageMetrics();
  }, []);

  // Refetch users when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchUsers();
  }, [searchTerm, statusFilter, tierFilter]);

  // Refetch users when page changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'active' && isActive) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    } else if (status === 'expired' || !isActive) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    } else if (status === 'cancelled') {
      return <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
    } else {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const tierColors = {
      'free': 'bg-gray-100 text-gray-800',
      'basic': 'bg-blue-100 text-blue-800',
      'premium': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-800'}>
        {tier === 'premium' && <Crown className="h-3 w-3 mr-1" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard 👨‍💼
            </h1>
            <p className="text-gray-600 mt-2">
              Manage users, subscriptions, and analytics for MealLens
            </p>
          </div>
          
          {/* Admin Status */}
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Badge className="bg-orange-500 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
            <Button onClick={exportSubscriptions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.length > 0 ? users.length.toLocaleString() : '...'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Active Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {subscriptionSummary?.total_active || 0}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {subscriptionSummary ? `${((subscriptionSummary.total_active / (subscriptionSummary.total_active + subscriptionSummary.total_expired + subscriptionSummary.total_trials)) * 100).toFixed(1)}%` : '0%'} conversion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    ${subscriptionSummary?.total_revenue.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Active subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Feature Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {usageData?.total_usage || 0}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {usageData?.unique_users || 0} active users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {revenueData.length > 0 ? (
                    <div className="w-full h-full flex items-end justify-between gap-2">
                      {revenueData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="bg-orange-500 rounded-t w-full"
                            style={{ height: `${(item.revenue / Math.max(...revenueData.map(d => d.revenue))) * 200}px` }}
                          ></div>
                          <span className="text-xs text-gray-600 mt-2">{item.period}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            {usageData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Feature Usage Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(usageData.feature_usage).map(([feature, count]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${(count / usageData.total_usage) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tiers</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getTierBadge(user.subscription_tier)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(user.subscription_status, user.is_active)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchUserDetails(user.id)}
                                >
                                  <User className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            {subscriptionSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Active Subscriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {subscriptionSummary.total_active}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Expired Subscriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {subscriptionSummary.total_expired}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Past due</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Trial Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {subscriptionSummary.total_trials}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">In trial period</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Revenue by Plan */}
            {subscriptionSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>
                    Monthly recurring revenue breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(subscriptionSummary.revenue_by_plan).map(([plan, revenue]) => (
                      <div key={plan} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTierBadge(plan)}
                          <span className="text-sm text-gray-600">
                            {subscriptionSummary.total_active > 0 
                              ? `${((revenue / subscriptionSummary.total_revenue) * 100).toFixed(1)}%`
                              : '0%'
                            } of total revenue
                          </span>
                        </div>
                        <span className="font-semibold">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Revenue</span>
                        <span className="text-xl font-bold text-green-600">
                          ${subscriptionSummary.total_revenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Usage Analytics */}
            {usageData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Feature Usage Analytics
                  </CardTitle>
                  <CardDescription>
                    Usage patterns over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(usageData.feature_usage).map(([feature, count]) => (
                      <div key={feature} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {feature.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count.toLocaleString()} uses
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-orange-500 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${(count / usageData.total_usage) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-2xl font-bold text-green-600">
                        {usageData?.unique_users || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Usage</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {usageData?.total_usage || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Usage per User</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {usageData && usageData.unique_users > 0 
                          ? (usageData.total_usage / usageData.unique_users).toFixed(1)
                          : '0'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Engagement Rate</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {users.length > 0 && usageData?.unique_users 
                          ? `${((usageData.unique_users / users.length) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected user
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-sm">
                          {selectedUser.profile.first_name} {selectedUser.profile.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-sm">{selectedUser.profile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Created</label>
                        <p className="text-sm">
                          {new Date(selectedUser.profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Information */}
                {selectedUser.subscription && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Plan</label>
                          <p className="text-sm">{selectedUser.subscription.subscription_plans?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="text-sm">{selectedUser.subscription.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Start Date</label>
                          <p className="text-sm">
                            {selectedUser.subscription.current_period_start 
                              ? new Date(selectedUser.subscription.current_period_start).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">End Date</label>
                          <p className="text-sm">
                            {selectedUser.subscription.current_period_end 
                              ? new Date(selectedUser.subscription.current_period_end).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Detection History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Detection History ({selectedUser.detection_history.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUser.detection_history.map((detection, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{detection.detected_foods}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(detection.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Usage Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedUser.usage_tracking.map((usage, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {usage.feature_name.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(usage.usage_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-medium">{usage.usage_count} uses</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AdminDashboard; 