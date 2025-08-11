import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/utils';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  ChefHat, 
  Search, 
  Sparkles, 
  Shield, 
  Clock, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Heart,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Crown,
  Play,
  Menu,
  X,
  Target,
  Award,
  TrendingUp,
  Smartphone as MobileIcon
} from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Launch date - set to a future date for countdown
  const launchDate = new Date('2024-12-25T00:00:00Z');

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect authenticated users to home only if they're on the root path
  useEffect(() => {
    if (user && window.location.pathname === '/') {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleTryMealLensAI = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/home');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-orange-500">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo size="lg" showText={true} onClick={() => navigate('/')} />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <a href="#home" className="text-gray-700 hover:text-[#FF6B6B] text-sm lg:text-base transition-colors font-medium">Home</a>
              <a href="#features" className="text-gray-700 hover:text-[#FF6B6B] text-sm lg:text-base transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-[#FF6B6B] text-sm lg:text-base transition-colors font-medium">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-[#FF6B6B] text-sm lg:text-base transition-colors font-medium">Pricing</a>
            </nav>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!user ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors hidden sm:inline-flex"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white transition-colors"
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-gray-700 text-sm lg:text-base truncate max-w-32 lg:max-w-none">{user.email}</span>
                  <Button 
                    variant="outline"
                    onClick={signOut}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-3 pt-4">
                <a href="#home" className="text-gray-700 hover:text-[#FF6B6B] transition-colors font-medium">Home</a>
                <a href="#features" className="text-gray-700 hover:text-[#FF6B6B] transition-colors font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-[#FF6B6B] transition-colors font-medium">How It Works</a>
                <a href="#pricing" className="text-gray-700 hover:text-[#FF6B6B] transition-colors font-medium">Pricing</a>
                {!user && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors mt-2"
                  >
                    Sign In
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Countdown */}
      <section id="home" className="py-8 sm:py-12 lg:py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 sm:mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="h-3 w-3 mr-2" />
                AI-Powered Kitchen Assistant
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Transform Your
                <span className="block text-yellow-200">Culinary Journey</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Snap a picture of your ingredients or meal, and let our AI guide you with recipes, 
                cooking tips, and personalized suggestions. Your smart kitchen companion.
              </p>

              {/* Live Countdown */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-4">Launching Soon!</h3>
                <div className="flex justify-center lg:justify-start space-x-2 sm:space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{countdown.days}</div>
                    <div className="text-xs sm:text-sm text-white/80">Days</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{countdown.hours}</div>
                    <div className="text-xs sm:text-sm text-white/80">Hours</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{countdown.minutes}</div>
                    <div className="text-xs sm:text-sm text-white/80">Minutes</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{countdown.seconds}</div>
                    <div className="text-xs sm:text-sm text-white/80">Seconds</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleTryMealLensAI}
                  size="lg"
                  className="bg-white text-[#FF6B6B] hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Cooking Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#FF6B6B] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">10,000+ Happy Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                  <span className="text-xs sm:text-sm">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Secure & Private</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center order-first lg:order-last">
              <div className="relative">
                {/* Main illustration */}
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
                    <div className="text-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Smart Food Detection</h3>
                      <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">Point your camera at any food and get instant recognition</p>
                      <div className="flex justify-center space-x-3 sm:space-x-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <Search className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Sparkles className="h-3 w-3 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Everything You Need for
              <span className="text-[#FF6B6B] block">Smart Cooking</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From ingredient detection to personalized meal planning, we've got you covered with AI-powered features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Smart Detection</CardTitle>
                <CardDescription className="text-gray-600">
                  Instantly recognize ingredients and dishes with our advanced AI technology
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Recipe Generation</CardTitle>
                <CardDescription className="text-gray-600">
                  Get personalized recipes based on your ingredients and dietary preferences
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Meal Planning</CardTitle>
                <CardDescription className="text-gray-600">
                  Plan your meals with AI assistance and track your nutritional goals
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Health Tracking</CardTitle>
                <CardDescription className="text-gray-600">
                  Monitor your nutrition and get health-conscious meal suggestions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Progress Analytics</CardTitle>
                <CardDescription className="text-gray-600">
                  Track your cooking journey and see your improvement over time
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Achievement System</CardTitle>
                <CardDescription className="text-gray-600">
                  Earn badges and rewards as you master new recipes and techniques
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Zap className="h-3 w-3 mr-2" />
              Simple Steps
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just three simple steps and transform your cooking experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Snap a Photo</h3>
              <p className="text-gray-600">
                Take a picture of your ingredients or finished dish using your smartphone camera.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI instantly recognizes ingredients and provides detailed nutritional information.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <ChefHat className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Recipes</h3>
              <p className="text-gray-600">
                Receive personalized recipe suggestions and cooking instructions tailored to your preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Crown className="h-3 w-3 mr-2" />
              Choose Your Plan
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Simple, Transparent Pricing
              </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our free plan and upgrade when you're ready for more features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-[#FF6B6B] transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Free</CardTitle>
                <div className="text-4xl font-bold text-[#FF6B6B] mb-2">$0</div>
                <CardDescription className="text-gray-600">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">5 free detections per month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic recipe suggestions</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Nutritional information</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
                  onClick={() => navigate('/signup')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-[#FF6B6B] shadow-xl transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#FF6B6B] text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
                <div className="text-4xl font-bold text-[#FF6B6B] mb-2">$9.99</div>
                <CardDescription className="text-gray-600">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited detections</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced AI recipes</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Meal planning</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Health tracking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                  onClick={() => navigate('/payment')}
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-[#FF6B6B] transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Premium</CardTitle>
                <div className="text-4xl font-bold text-[#FF6B6B] mb-2">$19.99</div>
                <CardDescription className="text-gray-600">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Everything in Pro</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Family accounts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom meal plans</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">24/7 support</span>
                  </div>
            </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
                  onClick={() => navigate('/payment')}
                >
                  Get Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="lg" showText={true} onClick={() => navigate('/')} />
              <p className="mt-4 text-gray-400 max-w-md">
                Transform your culinary journey with AI-powered food detection and personalized recipe suggestions.
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF6B6B] transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF6B6B] transition-colors">
                  <MobileIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MealLens AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage; 