import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  ChefHat, 
  Calendar, 
  History, 
  Clock,
  Star,
  ArrowRight,
  Target,
  User
} from 'lucide-react';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import LoadingLine from '@/components/LoadingLine';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    subscription, 
    isInTrial, 
    getTrialDaysLeft, 
    getDaysUntilExpiry,
    isSubscriptionExpired,
    getPlanDisplayName,
    getDaysUntilFreeTierReset,
    freeUsageCount,
    maxFreeUsage,
    canUseFeature,
    getPlanPrice
  } = useSubscription();
  
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check if user is new (within 3 days of registration)
  const isNewUser = user && (user as any).created_at && 
    (new Date().getTime() - new Date((user as any).created_at).getTime()) < (3 * 24 * 60 * 60 * 1000);

  // Profile completion status
  const profileCompletion = {
    isComplete: user?.displayName && user?.email,
    message: user?.displayName ? 'Profile complete' : 'Complete your profile to personalize meal plans',
    progress: user?.displayName ? 100 : 50
  };

  // Define quickActions after subscription context is available
  const quickActions = [
    {
      title: 'Try Food Detection',
      description: 'Take a photo of your food to get instant nutritional information',
      icon: Camera,
      path: '/detect-food',
      color: 'bg-blue-500',
      disabled: !canUseFeature('food_detection')
    },
    {
      title: 'Use AI Kitchen',
      description: 'Get recipe suggestions from ingredients you have',
      icon: ChefHat,
      path: '/ai-kitchen',
      color: 'bg-orange-500',
      disabled: !canUseFeature('ingredient_detection')
    },
    {
      title: 'Plan Your Meals',
      description: 'Create personalized meal plans with AI assistance',
      icon: Calendar,
      path: '/meal-planner',
      color: 'bg-green-500',
      disabled: !canUseFeature('meal_planning')
    }
  ];

  const stats = [
    {
      title: 'Trial Status',
      value: isInTrial ? `${getTrialDaysLeft()} days left` : 'Trial expired',
      icon: Clock,
      color: isInTrial ? 'text-orange-500' : 'text-red-500',
      subtitle: isInTrial ? 'Full access to all features' : 'Upgrade to continue',
      progress: isInTrial ? ((3 - getTrialDaysLeft()) / 3) * 100 : 100
    },
    {
      title: 'Profile Status',
      value: profileCompletion.isComplete ? 'Complete' : 'Incomplete',
      icon: User,
      color: profileCompletion.isComplete ? 'text-green-500' : 'text-orange-500',
      subtitle: profileCompletion.message,
      progress: profileCompletion.progress
    },
    {
      title: 'Current Plan',
      value: getPlanDisplayName(subscription?.plan?.name || 'free'),
      icon: Star,
      color: 'text-orange-500',
      subtitle: subscription?.plan?.name === 'free' ? 'Free tier' : 'Active subscription'
    }
  ];

  const recentActivity = [
    {
      type: 'detection',
      title: 'Food Detection',
      description: isInTrial ? 'Unlimited detections during trial' : 'Upgrade to access food detection',
      icon: Camera,
      color: isInTrial ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400',
      action: isInTrial ? 'Start Detection' : 'Upgrade'
    },
    {
      type: 'meal_plan',
      title: 'Meal Planning',
      description: isInTrial ? 'Unlimited meal planning during trial' : 'Upgrade to access meal planning',
      icon: Calendar,
      color: isInTrial ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400',
      action: isInTrial ? 'Start Planning' : 'Upgrade'
    },
    {
      type: 'ai_kitchen',
      title: 'AI Kitchen Assistant',
      description: isInTrial ? 'Unlimited AI kitchen access during trial' : 'Upgrade to access AI kitchen',
      icon: ChefHat,
      color: isInTrial ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400',
      action: isInTrial ? 'Try AI Kitchen' : 'Upgrade'
    }
  ];

  const tips = [
    {
      title: 'Enjoy Your 3-Day Trial',
      description: 'You have full access to all features for 3 days. Try everything!',
      icon: Target
    },
    {
      title: 'Flexible Plans Available',
      description: 'Weekly ($2.50), Two Weeks ($5.00), or Monthly ($10.00) - all in USD.',
      icon: Star // Changed from Crown to Star as Crown is removed
    },
    {
      title: 'Complete Your Profile',
      description: 'Add your preferences to get personalized meal suggestions.',
      icon: User
    }
  ];

  if (isLoading) {
    return <LoadingLine />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.displayName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Ready to explore your culinary journey with AI-powered food recognition and meal planning?
              </p>
            </div>
            
            {/* Subscription Status */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {subscription?.plan?.name !== 'free' && (
                <Badge className="bg-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  {getPlanDisplayName(subscription?.plan?.name || 'free')}
                </Badge>
              )}
              {isInTrial && (
                <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                  <Clock className="h-3 w-3 mr-1" />
                  Trial - {getTrialDaysLeft()} days left
                </Badge>
              )}
              {subscription?.plan?.name === 'free' && !isInTrial && (
                <Badge variant="secondary" className="text-gray-700 bg-gray-100">
                  <Calendar className="h-3 w-3 mr-1" />
                  Resets in {getDaysUntilFreeTierReset()} days
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* New User Welcome Banner */}
        {isNewUser && isInTrial && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🎉 Welcome to MealLensAI! You have 3 days of free access
                </h3>
                <p className="text-blue-700 mb-4">
                  Enjoy unlimited access to all features including food detection, AI kitchen assistant, meal planning, and more. 
                  No restrictions, no limits - just explore everything we have to offer!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Camera className="h-3 w-3 mr-1" />
                    Food Detection
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <ChefHat className="h-3 w-3 mr-1" />
                    AI Kitchen
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    Meal Planning
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <History className="h-3 w-3 mr-1" />
                    History
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      {stat.progress !== undefined && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(stat.progress, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/payment')}
              className="text-orange-600 hover:text-orange-700"
            >
              View Plans
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-300 group border-0 shadow-md ${
                    action.disabled ? 'opacity-60' : ''
                  }`}
                  onClick={() => !action.disabled && navigate(action.path)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 mb-4">
                      {action.description}
                    </CardDescription>
                    {action.disabled ? (
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 text-gray-500 cursor-not-allowed"
                        disabled
                      >
                        Upgrade Required
                      </Button>
                    ) : (
                                          <Button 
                      variant="outline" 
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 py-3 sm:py-2"
                    >
                      Get Started
                    </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Detections */}
          <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Detections
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                    onClick={() => navigate('/history')}
                    className="text-blue-600 hover:text-blue-700"
                    >
                    View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  {history && history.length > 0 ? (
                    history.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Camera className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.suggestion || 'Food Detection'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/history/${item.id}`)}
                        >
                          View
                        </Button>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No detections yet</p>
                      <Button onClick={() => navigate('/detect-food')} variant="outline">
                        Start Detecting
                      </Button>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* Tips & Suggestions */}
          <div className="space-y-6">
            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-500" />
                  Tips & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tips.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{tip.title}</p>
                          <p className="text-xs text-gray-600">{tip.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {!profileCompletion.isComplete && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <User className="h-5 w-5 mr-2" />
                    Complete Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-700 mb-4">
                    Add your preferences to get personalized meal suggestions.
                  </p>
                  <Button 
                    onClick={() => navigate('/profile')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 