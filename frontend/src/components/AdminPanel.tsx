import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Settings, 
  Eye, 
  EyeOff,
  BarChart3,
  Calendar,
  Clock,
  Star,
  Crown,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Target,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  premiumUsers: number;
  trialUsers: number;
  freeUsers: number;
}

interface UsageStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  totalSessions: number;
  featureUsage: {
    foodDetection: number;
    mealPlanning: number;
    recipeSearch: number;
    aiKitchen: number;
  };
}

interface AdSettings {
  enabled: boolean;
  placement: 'top' | 'bottom' | 'sidebar' | 'inline';
  frequency: 'low' | 'medium' | 'high';
  type: 'banner' | 'card' | 'native';
  targetAudience: string[];
}

interface FeatureSettings {
  name: string;
  enabled: boolean;
  restricted: boolean;
  requiresPremium: boolean;
  description: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 12543,
    activeUsers: 8921,
    newUsers: 234,
    premiumUsers: 3456,
    trialUsers: 1234,
    freeUsers: 7853
  });

  const [usageStats, setUsageStats] = useState<UsageStats>({
    dailyActiveUsers: 2341,
    weeklyActiveUsers: 8921,
    monthlyActiveUsers: 15432,
    averageSessionDuration: 8.5,
    totalSessions: 45678,
    featureUsage: {
      foodDetection: 12345,
      mealPlanning: 8765,
      recipeSearch: 6543,
      aiKitchen: 5432
    }
  });

  const [adSettings, setAdSettings] = useState<AdSettings>({
    enabled: true,
    placement: 'inline',
    frequency: 'medium',
    type: 'card',
    targetAudience: ['free', 'trial']
  });

  const [featureSettings, setFeatureSettings] = useState<FeatureSettings[]>([
    {
      name: 'Food Detection',
      enabled: true,
      restricted: false,
      requiresPremium: false,
      description: 'AI-powered food recognition from images'
    },
    {
      name: 'Meal Planning',
      enabled: true,
      restricted: true,
      requiresPremium: true,
      description: 'Advanced meal planning with AI suggestions'
    },
    {
      name: 'Recipe Search',
      enabled: true,
      restricted: false,
      requiresPremium: false,
      description: 'Search and discover recipes'
    },
    {
      name: 'AI Kitchen Assistant',
      enabled: true,
      restricted: true,
      requiresPremium: true,
      description: 'AI-powered cooking assistance and tips'
    },
    {
      name: 'Premium Features',
      enabled: true,
      restricted: true,
      requiresPremium: true,
      description: 'Access to premium features and content'
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);

  // Mock data - in production, this would come from API
  const getGrowthRate = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getDeviceStats = () => ({
    mobile: 65,
    desktop: 25,
    tablet: 10
  });

  const getGeographicStats = () => ({
    'United States': 45,
    'United Kingdom': 15,
    'Canada': 12,
    'Australia': 8,
    'Germany': 6,
    'Other': 14
  });

  const handleAdSettingChange = (key: keyof AdSettings, value: any) => {
    setAdSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (index: number, key: keyof FeatureSettings, value: any) => {
    const updatedFeatures = [...featureSettings];
    updatedFeatures[index] = { ...updatedFeatures[index], [key]: value };
    setFeatureSettings(updatedFeatures);
  };

  const handleSaveSettings = () => {
    // Save settings to backend
    console.log('Saving settings:', { adSettings, featureSettings });
    setIsEditing(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">Manage app settings, users, and analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
            {isEditing && (
              <>
                <Button
                  onClick={handleSaveSettings}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-3 w-3 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  size="sm"
                >
                  <X className="h-3 w-3 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="p-4 border-b bg-white">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="ads" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ads
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Features
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{userStats.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-green-600 mt-1">
                        +{getGrowthRate(userStats.newUsers, userStats.totalUsers - userStats.newUsers)}% this week
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{userStats.activeUsers.toLocaleString()}</div>
                      <p className="text-xs text-blue-600 mt-1">
                        {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Premium Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{userStats.premiumUsers.toLocaleString()}</div>
                      <p className="text-xs text-purple-600 mt-1">
                        {((userStats.premiumUsers / userStats.totalUsers) * 100).toFixed(1)}% conversion
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Daily Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{usageStats.dailyActiveUsers.toLocaleString()}</div>
                      <p className="text-xs text-orange-600 mt-1">
                        {usageStats.averageSessionDuration}min avg session
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Usage Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Feature Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(usageStats.featureUsage).map(([feature, count]) => (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(usageStats.featureUsage))) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{count.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Device Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(getDeviceStats()).map(([device, percentage]) => (
                          <div key={device} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {device === 'mobile' && <Smartphone className="h-4 w-4 text-gray-600" />}
                              {device === 'desktop' && <Monitor className="h-4 w-4 text-gray-600" />}
                              {device === 'tablet' && <Monitor className="h-4 w-4 text-gray-600" />}
                              <span className="text-sm font-medium capitalize">{device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Premium</span>
                        </div>
                        <Badge variant="outline">{userStats.premiumUsers.toLocaleString()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">Trial</span>
                        </div>
                        <Badge variant="outline">{userStats.trialUsers.toLocaleString()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">Free</span>
                        </div>
                        <Badge variant="outline">{userStats.freeUsers.toLocaleString()}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        User Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>User growth chart would be displayed here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Ads Tab */}
              <TabsContent value="ads" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Advertisement Settings
                    </CardTitle>
                    <CardDescription>
                      Configure ad display settings and targeting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ads-enabled" className="text-sm font-medium">Enable Ads</Label>
                        <p className="text-xs text-gray-500">Show advertisements to users</p>
                      </div>
                      <Switch
                        id="ads-enabled"
                        checked={adSettings.enabled}
                        onCheckedChange={(checked) => handleAdSettingChange('enabled', checked)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ad-placement" className="text-sm font-medium">Ad Placement</Label>
                        <Select 
                          value={adSettings.placement} 
                          onValueChange={(value) => handleAdSettingChange('placement', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                            <SelectItem value="inline">Inline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ad-frequency" className="text-sm font-medium">Ad Frequency</Label>
                        <Select 
                          value={adSettings.frequency} 
                          onValueChange={(value) => handleAdSettingChange('frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ad-type" className="text-sm font-medium">Ad Type</Label>
                      <Select 
                        value={adSettings.type} 
                        onValueChange={(value) => handleAdSettingChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Feature Management</h3>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                  >
                    {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {featureSettings.map((feature, index) => (
                    <Card key={feature.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{feature.name}</h4>
                              {feature.requiresPremium && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`feature-${index}-enabled`} className="text-xs">Enabled</Label>
                                <Switch
                                  id={`feature-${index}-enabled`}
                                  checked={feature.enabled}
                                  onCheckedChange={(checked) => handleFeatureToggle(index, 'enabled', checked)}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`feature-${index}-restricted`} className="text-xs">Restricted</Label>
                                <Switch
                                  id={`feature-${index}-restricted`}
                                  checked={feature.restricted}
                                  onCheckedChange={(checked) => handleFeatureToggle(index, 'restricted', checked)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 