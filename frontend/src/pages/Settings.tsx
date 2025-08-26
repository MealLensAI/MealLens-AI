import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Crown,
  Shield,
  LogOut,
  Save,
  Loader2,
  Settings as SettingsIcon,
  CreditCard,
  Eye,
  Mail,
  Lock,
  Trash2
} from 'lucide-react';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    mealReminders: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { subscription, getPlanDisplayName, getDaysUntilExpiry, isSubscriptionExpired } = useSubscription();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      mealReminders: true,
    },
    privacy: {
      dataCollection: true,
      analytics: true,
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
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
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Implement account deletion logic
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        });
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Created</Label>
                <p className="text-sm text-gray-600">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/profile')} 
                variant="outline" 
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-orange-500" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Plan</Label>
                <Badge variant={subscription?.plan?.name === 'free' ? 'secondary' : 'default'} className="text-sm">
                  {getPlanDisplayName(subscription?.plan?.name || 'free')}
                </Badge>
              </div>
              {subscription?.plan?.name !== 'free' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-gray-600">
                    {isSubscriptionExpired() ? (
                      <span className="text-red-600 font-medium">Expired</span>
                    ) : (
                      <span className="text-green-600 font-medium">Active - {getDaysUntilExpiry()} days remaining</span>
                    )}
                  </p>
                </div>
              )}
              <Button 
                onClick={() => navigate('/payment')} 
                variant="outline" 
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Notifications
              </CardTitle>
              <CardDescription>Control your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: {...settings.notifications, email: checked}})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications on device</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: {...settings.notifications, push: checked}})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Meal Reminders</Label>
                  <p className="text-xs text-gray-500">Get reminded about meal planning</p>
                </div>
                <Switch
                  checked={settings.notifications.mealReminders}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: {...settings.notifications, mealReminders: checked}})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Privacy
              </CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Data Collection</Label>
                  <p className="text-xs text-gray-500">Allow data collection for app improvement</p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => setSettings({...settings, privacy: {...settings.privacy, dataCollection: checked}})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Analytics</Label>
                  <p className="text-xs text-gray-500">Share usage analytics</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => setSettings({...settings, privacy: {...settings.privacy, analytics: checked}})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Settings */}
        <div className="mt-8">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

        <Separator className="my-8" />

        {/* Account Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            
            <Button 
              onClick={handleDeleteAccount} 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 