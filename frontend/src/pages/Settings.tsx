import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  Settings as SettingsIcon,
  User, 
  Bell, 
  Globe, 
  Type, 
  Bold, 
  Moon, 
  Sun,
  Crown,
  Clock,
  Shield,
  CreditCard,
  LogOut,
  Save,
  CheckCircle
} from 'lucide-react';

interface SettingsData {
  language: string;
  textSize: string;
  boldText: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    mealReminders: boolean;
    weeklyReports: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { subscription, isInTrial, getTrialDaysLeft } = useSubscription();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    language: 'en',
    textSize: 'medium',
    boldText: false,
    notifications: {
      email: true,
      push: true,
      mealReminders: true,
      weeklyReports: false,
    },
    theme: 'light'
  });

  // Load settings from localStorage or API
  useEffect(() => {
    const savedSettings = localStorage.getItem('meallens-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('meallens-settings', JSON.stringify(settings));
      
      // Apply theme
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // Auto theme - check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Apply text size
      const textSizeMap = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xlarge: 'text-xl'
      };
      
      // Remove existing text size classes
      document.body.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
      // Add new text size class
      document.body.classList.add(textSizeMap[settings.textSize as keyof typeof textSizeMap]);

      // Apply bold text
      if (settings.boldText) {
        document.body.classList.add('font-bold');
      } else {
        document.body.classList.remove('font-bold');
      }

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateSettings = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationSettings = (key: keyof SettingsData['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Customize your MealLensAI experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance Settings */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#FF6B6B]" />
                  Appearance & Accessibility
                </CardTitle>
                <CardDescription>
                  Customize how MealLensAI looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSettings('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Size */}
                <div className="space-y-2">
                  <Label htmlFor="textSize">Text Size</Label>
                  <Select value={settings.textSize} onValueChange={(value) => updateSettings('textSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select text size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bold Text */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="boldText">Bold Text</Label>
                    <p className="text-sm text-gray-500">Make text easier to read</p>
                  </div>
                  <Switch
                    id="boldText"
                    checked={settings.boldText}
                    onCheckedChange={(checked) => updateSettings('boldText', checked)}
                  />
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSettings('theme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Auto (System)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#FF6B6B]" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateNotificationSettings('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications on your device</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateNotificationSettings('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mealReminders">Meal Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded about meal times</p>
                  </div>
                  <Switch
                    id="mealReminders"
                    checked={settings.notifications.mealReminders}
                    onCheckedChange={(checked) => updateNotificationSettings('mealReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly nutrition summaries</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => updateNotificationSettings('weeklyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-[#FF6B6B] hover:bg-[#FF5252]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#FF6B6B]" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-gray-900">{user?.email}</p>
                  <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.subscription?.status === 'active' ? (
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-[#FF6B6B] mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Active Subscription</p>
                    <p className="text-sm text-gray-600">
                      {subscription.plan?.display_name}
                    </p>
                  </div>
                ) : isInTrial() ? (
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="font-semibold text-orange-800">Free Trial</p>
                    <p className="text-sm text-gray-600">
                      {getTrialDaysLeft()} days remaining
                    </p>
                    <Button 
                      onClick={() => navigate('/payment')}
                      className="w-full mt-3 bg-[#FF6B6B] hover:bg-[#FF5252]"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">Free Plan</p>
                    <p className="text-sm text-gray-600">
                      Limited features
                    </p>
                    <Button 
                      onClick={() => navigate('/payment')}
                      className="w-full mt-3 bg-[#FF6B6B] hover:bg-[#FF5252]"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Get Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-gray-600" />
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
                  Billing
                </Button>
                <Separator />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 