import React, { useEffect } from 'react';
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
  Crown
} from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-orange-500">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo size="lg" showText={true} onClick={() => navigate('/')} />
            </div>
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
                    className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="h-3 w-3 mr-2" />
                AI-Powered Kitchen Assistant
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                Transform Your
                <span className="block text-yellow-200">Culinary Journey</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Snap a picture of your ingredients or meal, and let our AI guide you with recipes, 
                cooking tips, and personalized suggestions. Your smart kitchen companion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleTryMealLensAI}
                  size="lg"
                  className="bg-white text-[#FF6B6B] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Cooking Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#FF6B6B] px-8 py-4 text-lg font-semibold transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">10,000+ Happy Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Secure & Private</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center order-first lg:order-last">
              <div className="relative">
                {/* Main illustration */}
                <div className="relative w-full max-w-lg lg:max-w-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Camera className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Smart Food Detection</h3>
                      <p className="text-white/80 mb-6">Point your camera at any food and get instant recognition</p>
                      <div className="flex justify-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-white" />
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <Search className="h-8 w-8 text-white" />
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <Heart className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Sparkles className="h-3 w-3 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="text-[#FF6B6B]"> Smart Cooking</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why MealLensAI is the ultimate kitchen companion with cutting-edge AI technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Smart Ingredient Recognition</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Snap a picture or upload an image of your ingredients, and let MealLensAI
                  identify them instantly using cutting-edge AI technology.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline" className="text-xs">Real-time</Badge>
                  <Badge variant="outline" className="text-xs">Accurate</Badge>
                  <Badge variant="outline" className="text-xs">Fast</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Recipe Suggestions & AI Review</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Discover recipes based on your ingredients, get quick meal ideas, and missing ingredients.
                  Also snap your finished dish, and let AI score how well you made it.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline" className="text-xs">Personalized</Badge>
                  <Badge variant="outline" className="text-xs">AI-Powered</Badge>
                  <Badge variant="outline" className="text-xs">Creative</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Smart Food Detection</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Capture a photo of any prepared meal, and let our AI identify the dish and provide
                  the full recipe with ingredient list and step-by-step cooking instructions.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline" className="text-xs">Instant</Badge>
                  <Badge variant="outline" className="text-xs">Detailed</Badge>
                  <Badge variant="outline" className="text-xs">Educational</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Zap className="h-3 w-3 mr-2" />
              Simple Steps
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How MealLensAI
              <span className="text-[#FF6B6B]"> Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just three simple steps and transform your cooking experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Snap a Photo</h3>
              <p className="text-gray-600 leading-relaxed">
                Take a picture of your ingredients or finished dish using your camera or upload an existing image.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI instantly recognizes ingredients, suggests recipes, and provides cooking guidance.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cook & Enjoy</h3>
              <p className="text-gray-600 leading-relaxed">
                Follow the detailed recipes, cooking tips, and enjoy your perfectly prepared meal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Crown className="h-3 w-3 mr-2" />
              Choose Your Plan
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Simple & Transparent
              <span className="text-[#FF6B6B]"> Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade when you're ready to unlock premium features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-[#FF6B6B] transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Free Plan</CardTitle>
                <div className="text-4xl font-bold text-gray-900">
                  $0
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">5 food detections per day</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Basic recipe suggestions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Standard AI responses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Community support</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
                  onClick={handleTryMealLensAI}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            {/* Premium Plan */}
            <Card className="relative border-2 border-[#FF6B6B] bg-gradient-to-br from-[#FF6B6B]/5 to-[#FF8E8E]/5">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#FF6B6B] text-white px-4 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Premium Plan</CardTitle>
                <div className="text-4xl font-bold text-[#FF6B6B]">
                  $9.99
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Unlimited food detections</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Advanced recipe suggestions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Premium AI responses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Meal planning features</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                  onClick={() => navigate('/signup')}
                >
                  Start Premium Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Responsive Design Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Globe className="h-3 w-3 mr-2" />
              Works Everywhere
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Perfect on Every
              <span className="text-[#FF6B6B]"> Device</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access MealLensAI seamlessly across all your devices with our responsive design.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile</h3>
              <p className="text-gray-600">
                Perfect for on-the-go cooking with touch-optimized interface and camera integration.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Tablet className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tablet</h3>
              <p className="text-gray-600">
                Enhanced viewing experience with larger screens for detailed recipe instructions.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Desktop</h3>
              <p className="text-gray-600">
                Full-featured experience with advanced meal planning and recipe management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block text-yellow-200">Cooking Experience?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already cooking smarter with MealLensAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleTryMealLensAI}
              size="lg"
              className="bg-white text-[#FF6B6B] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Start Cooking Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#FF6B6B] px-8 py-4 text-lg font-semibold"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="lg" showText={true} onClick={() => navigate('/')} />
              <p className="mt-4 text-gray-400 max-w-md">
                MealLensAI is your smart kitchen assistant, powered by cutting-edge AI technology 
                to help you cook better, discover new recipes, and enjoy your culinary journey.
              </p>
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
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2024 MealLensAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage; 