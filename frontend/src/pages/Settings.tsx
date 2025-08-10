import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Download, 
  Shield, 
  User, 
  CreditCard, 
  LogOut, 
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Globe,
  Palette,
  Moon,
  Sun,
  Monitor,
  Zap,
  Crown,
  Clock,
  CheckCircle
} from 'lucide-react';
import UsageDashboard from '@/components/UsageDashboard';

const Settings = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { subscription, isInTrial, getTrialDaysLeft } = useSubscription();
  const navigate = useNavigate();

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  // Theme settings
  const [theme, setTheme] = useState('system');

  const handleSaveNotifications = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy Updated",
      description: "Your privacy settings have been saved.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export has been initiated. You'll receive an email when it's ready.",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">
            Manage your account settings, preferences, and privacy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Section */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Account
                </CardTitle>
                <CardDescription>
                  Manage your account information and profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Profile & Health</h3>
                      <p className="text-sm text-gray-600">Manage personal info and health conditions</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                    className="bg-white"
                  >
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Payment & Subscription</h3>
                      <p className="text-sm text-gray-600">Manage billing and subscription</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/payment')}
                    className="bg-white"
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  View your current subscription and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      {subscription?.subscription?.status === 'active' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : isInTrial() ? (
                        <Clock className="h-6 w-6 text-orange-600" />
                      ) : (
                        <Shield className="h-6 w-6 text-gray-600" />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {subscription?.subscription?.status === 'active' ? 'Premium Active' :
                           isInTrial() ? `Free Trial - ${getTrialDaysLeft()} days left` :
                           'Free Plan'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {subscription?.subscription?.status === 'active' ? 
                            `Renews ${subscription.subscription.current_period_end ? 
                              new Date(subscription.subscription.current_period_end).toLocaleDateString() : 
                              'Unknown'
                            }` :
                           isInTrial() ? 'Upgrade to continue using premium features' :
                           'Limited features available'
                          }
                        </p>
                      </div>
                    </div>
                    {!subscription?.subscription?.status === 'active' && (
                      <Button 
                        onClick={() => navigate('/payment')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isInTrial() ? 'Upgrade' : 'Get Premium'}
                      </Button>
                    )}
                  </div>

                  {/* Usage Dashboard */}
                  <UsageDashboard />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Get real-time notifications</p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Meal Reminders</Label>
                      <p className="text-sm text-gray-600">Daily meal plan reminders</p>
                    </div>
                    <Switch
                      checked={mealReminders}
                      onCheckedChange={setMealReminders}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Receive promotional content</p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Profile Visibility</Label>
                      <p className="text-sm text-gray-600">Control who can see your profile</p>
                    </div>
                    <select 
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Data Sharing</Label>
                      <p className="text-sm text-gray-600">Allow data sharing for research</p>
                    </div>
                    <Switch
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Analytics Tracking</Label>
                      <p className="text-sm text-gray-600">Help improve the app with analytics</p>
                    </div>
                    <Switch
                      checked={analyticsTracking}
                      onCheckedChange={setAnalyticsTracking}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleSavePrivacy} className="w-full bg-green-600 hover:bg-green-700">
                    Save Privacy Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the app's appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Theme</Label>
                    <p className="text-sm text-gray-600">Choose your preferred theme</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/payment')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Need help? Contact our support team for assistance.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('mailto:support@meallensai.com', '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 