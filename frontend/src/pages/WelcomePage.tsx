import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  ChefHat, 
  Calendar, 
  Zap, 
  Crown, 
  Shield, 
  ArrowRight, 
  Play,
  Star,
  Users,
  Globe
} from 'lucide-react';

const WelcomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MealLens</h1>
                <p className="text-sm text-gray-600">AI-Powered Nutrition</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#FF6B6B] transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-[#FF6B6B] transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-600 hover:text-[#FF6B6B] transition-colors">
                About
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-[#FF6B6B]">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
              <Zap className="mr-2 h-4 w-4" />
              AI-Powered Nutrition Assistant
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="text-[#FF6B6B]"> Nutrition</span>
              <br />
              with AI
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover personalized meal plans, analyze your food photos, and get expert nutrition advice powered by advanced artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup">
                <Button size="lg" className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B6B] mb-2">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B6B] mb-2">50K+</div>
                <div className="text-gray-600">Meals Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B6B] mb-2">4.9★</div>
                <div className="text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#FF6B6B]/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-[#FF6B6B]/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-[#FF6B6B]/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Nutrition
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive nutrition tools to help you achieve your health goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">AI Food Detection</CardTitle>
                <CardDescription>
                  Simply take a photo of your meal and get instant nutritional analysis, ingredients breakdown, and health insights.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Meal Planning</CardTitle>
                <CardDescription>
                  Get personalized meal plans based on your preferences, dietary restrictions, and nutritional goals.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your nutrition journey with detailed analytics, progress reports, and personalized recommendations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with a free trial and upgrade when you're ready to unlock all features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold text-gray-900">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-500 mr-3" />
                    <span>3-day free trial</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-500 mr-3" />
                    <span>Basic food detection</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-500 mr-3" />
                    <span>Limited meal plans</span>
                  </div>
                </div>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-[#FF6B6B] relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#FF6B6B] text-white px-4 py-2">
                  <Crown className="mr-2 h-4 w-4" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-gray-900">$9.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-[#FF6B6B] mr-3" />
                    <span>Unlimited food detection</span>
                  </div>
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-[#FF6B6B] mr-3" />
                    <span>Advanced meal planning</span>
                  </div>
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-[#FF6B6B] mr-3" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-[#FF6B6B] mr-3" />
                    <span>Detailed analytics</span>
                  </div>
                </div>
                <Link to="/signup">
                  <Button className="w-full bg-[#FF6B6B] hover:bg-[#FF5252]">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900">Custom</div>
                <CardDescription>For teams and organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Team management</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Advanced analytics</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already improved their health with AI-powered nutrition guidance.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#FF6B6B] hover:bg-gray-100 px-8 py-4 text-lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-lg flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MealLens</span>
              </div>
              <p className="text-gray-400">
                AI-powered nutrition assistant helping you achieve your health goals.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MealLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage; 