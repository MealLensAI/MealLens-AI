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
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 bg-white border-b border-gray-200">
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Customize your MealLensAI experience</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
            {/* Main Settings */}
            <div className="lg:col-span-3 space-y-4 overflow-y-auto">
              {/* Appearance Settings */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-[#FF6B6B]" />
                    Appearance & Accessibility
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Customize how MealLensAI looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Language */}
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                      <Select value={settings.language} onValueChange={(value) => updateSettings('language', value)}>
                        <SelectTrigger className="h-10">
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
                      <Label htmlFor="textSize" className="text-sm font-medium">Text Size</Label>
                      <Select value={settings.textSize} onValueChange={(value) => updateSettings('textSize', value)}>
                        <SelectTrigger className="h-10">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bold Text */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="boldText" className="text-sm font-medium">Bold Text</Label>
                        <p className="text-xs text-gray-500">Make text easier to read</p>
                      </div>
                      <Switch
                        id="boldText"
                        checked={settings.boldText}
                        onCheckedChange={(checked) => updateSettings('boldText', checked)}
                      />
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                      <Select value={settings.theme} onValueChange={(value) => updateSettings('theme', value)}>
                        <SelectTrigger className="h-10">
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
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-[#FF6B6B]" />
                    Notifications
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => updateNotificationSettings('email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications" className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-xs text-gray-500">Receive notifications on your device</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => updateNotificationSettings('push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="mealReminders" className="text-sm font-medium">Meal Reminders</Label>
                        <p className="text-xs text-gray-500">Get reminded about meal times</p>
                      </div>
                      <Switch
                        id="mealReminders"
                        checked={settings.notifications.mealReminders}
                        onCheckedChange={(checked) => updateNotificationSettings('mealReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="weeklyReports" className="text-sm font-medium">Weekly Reports</Label>
                        <p className="text-xs text-gray-500">Receive weekly nutrition summaries</p>
                      </div>
                      <Switch
                        id="weeklyReports"
                        checked={settings.notifications.weeklyReports}
                        onCheckedChange={(checked) => updateNotificationSettings('weeklyReports', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-[#FF6B6B] hover:bg-[#FF5252] px-6"
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
            <div className="space-y-4 overflow-y-auto">
              {/* Account Info */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-[#FF6B6B]" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-2">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{user?.email}</p>
                    <p className="text-xs text-gray-500">Member since {new Date().toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Status */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subscription?.subscription?.status === 'active' ? (
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 text-[#FF6B6B] mx-auto mb-2" />
                      <p className="font-medium text-green-800 text-sm">Active Subscription</p>
                      <p className="text-xs text-gray-600">
                        {subscription.plan?.display_name}
                      </p>
                    </div>
                  ) : isInTrial() ? (
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium text-orange-800 text-sm">Free Trial</p>
                      <p className="text-xs text-gray-600">
                        {getTrialDaysLeft()} days remaining
                      </p>
                      <Button 
                        onClick={() => navigate('/payment')}
                        className="w-full mt-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-xs"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Upgrade Now
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Shield className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-800 text-sm">Free Plan</p>
                      <p className="text-xs text-gray-600">
                        Limited features
                      </p>
                      <Button 
                        onClick={() => navigate('/payment')}
                        className="w-full mt-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-xs"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Get Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="h-3 w-3 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => navigate('/payment')}
                  >
                    <CreditCard className="h-3 w-3 mr-2" />
                    Billing
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm h-9"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3 w-3 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 