import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  CheckCircle,
  Eye,
  Volume2,
  Smartphone,
  Mail,
  Palette,
  Accessibility,
  Zap,
  Lock,
  Database,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface SettingsData {
  language: string;
  textSize: number; // Changed to number for slider
  boldText: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    mealReminders: boolean;
    weeklyReports: boolean;
    marketing: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    personalizedAds: boolean;
  };
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
    textSize: 16, // Default font size
    boldText: false,
    notifications: {
      email: true,
      push: true,
      mealReminders: true,
      weeklyReports: false,
      marketing: false,
    },
    theme: 'light',
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      screenReader: false,
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      personalizedAds: false,
    }
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('meallens-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        applySettings(parsed);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Apply settings to the app
  const applySettings = (newSettings: Partial<SettingsData>) => {
    // Apply theme
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // Auto theme
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }

    // Apply text size
    if (newSettings.textSize) {
      document.documentElement.style.fontSize = `${newSettings.textSize}px`;
    }

    // Apply bold text
    if (newSettings.boldText !== undefined) {
      if (newSettings.boldText) {
        document.body.classList.add('font-bold');
      } else {
        document.body.classList.remove('font-bold');
      }
    }

    // Apply accessibility settings
    if (newSettings.accessibility) {
      if (newSettings.accessibility.reduceMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0s');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
      }
    }
  };

  // Save settings to localStorage
  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('meallens-settings', JSON.stringify(settings));
      applySettings(settings);
      
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
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings({ [key]: value });
  };

  const updateNotificationSettings = (key: keyof SettingsData['notifications'], value: boolean) => {
    const newNotifications = { ...settings.notifications, [key]: value };
    const newSettings = { ...settings, notifications: newNotifications };
    setSettings(newSettings);
    applySettings({ notifications: newNotifications });
  };

  const updateAccessibilitySettings = (key: keyof SettingsData['accessibility'], value: boolean) => {
    const newAccessibility = { ...settings.accessibility, [key]: value };
    const newSettings = { ...settings, accessibility: newAccessibility };
    setSettings(newSettings);
    applySettings({ accessibility: newAccessibility });
  };

  const updatePrivacySettings = (key: keyof SettingsData['privacy'], value: boolean) => {
    const newPrivacy = { ...settings.privacy, [key]: value };
    const newSettings = { ...settings, privacy: newPrivacy };
    setSettings(newSettings);
    applySettings({ privacy: newPrivacy });
  };

  const handleTextSizeChange = (value: number[]) => {
    const newSize = value[0];
    updateSettings('textSize', newSize);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateSettings('theme', theme);
  };

  const getTextSizeLabel = (size: number) => {
    if (size <= 12) return 'Small';
    if (size <= 16) return 'Medium';
    if (size <= 20) return 'Large';
    return 'Extra Large';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Customize your MealLensAI experience</p>
          </div>
          <Button
            onClick={saveSettings}
            disabled={saving}
            size="sm"
            className="bg-[#FF6B6B] hover:bg-[#FF5252]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-4 overflow-y-auto">
              {/* Appearance & Accessibility */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5 text-[#FF6B6B]" />
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
                        <SelectTrigger className="h-9">
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

                    {/* Theme */}
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                      <Select value={settings.theme} onValueChange={handleThemeChange}>
                        <SelectTrigger className="h-9">
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

                  {/* Text Size Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Text Size</Label>
                      <span className="text-sm text-gray-600">{getTextSizeLabel(settings.textSize)}</span>
                    </div>
                    <Slider
                      value={[settings.textSize]}
                      onValueChange={handleTextSizeChange}
                      max={24}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Small</span>
                      <span>Large</span>
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

                    {/* Reduce Motion */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="reduceMotion" className="text-sm font-medium">Reduce Motion</Label>
                        <p className="text-xs text-gray-500">Minimize animations</p>
                      </div>
                      <Switch
                        id="reduceMotion"
                        checked={settings.accessibility.reduceMotion}
                        onCheckedChange={(checked) => updateAccessibilitySettings('reduceMotion', checked)}
                      />
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

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing" className="text-sm font-medium">Marketing</Label>
                        <p className="text-xs text-gray-500">Receive promotional content</p>
                      </div>
                      <Switch
                        id="marketing"
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) => updateNotificationSettings('marketing', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Data */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="h-5 w-5 text-[#FF6B6B]" />
                    Privacy & Data
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Control your data and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="dataCollection" className="text-sm font-medium">Data Collection</Label>
                        <p className="text-xs text-gray-500">Allow us to collect usage data</p>
                      </div>
                      <Switch
                        id="dataCollection"
                        checked={settings.privacy.dataCollection}
                        onCheckedChange={(checked) => updatePrivacySettings('dataCollection', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics" className="text-sm font-medium">Analytics</Label>
                        <p className="text-xs text-gray-500">Help improve the app</p>
                      </div>
                      <Switch
                        id="analytics"
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => updatePrivacySettings('analytics', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="personalizedAds" className="text-sm font-medium">Personalized Ads</Label>
                        <p className="text-xs text-gray-500">Show relevant advertisements</p>
                      </div>
                      <Switch
                        id="personalizedAds"
                        checked={settings.privacy.personalizedAds}
                        onCheckedChange={(checked) => updatePrivacySettings('personalizedAds', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => {
                      // Export data functionality
                      toast({
                        title: "Data Export",
                        description: "Your data export has been initiated.",
                      });
                    }}
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Export Data
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