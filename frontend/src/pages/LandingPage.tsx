import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/utils';
import Logo from '@/components/Logo';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleTryMealLensAI = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/ai-kitchen');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-orange-400">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo size="lg" showText={true} onClick={() => navigate('/')} />
            </div>
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <a href="#home" className="text-gray-700 hover:text-red-500 text-sm lg:text-base transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-red-500 text-sm lg:text-base transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-red-500 text-sm lg:text-base transition-colors">About</a>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!user ? (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 text-sm sm:text-base transition-colors"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-gray-700 text-sm lg:text-base truncate max-w-32 lg:max-w-none">{user.email}</span>
                  <button 
                    onClick={signOut}
                    className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
                Discover Meals with MealLensAI
              </h1>
              <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 leading-relaxed">
                MealLensAI is your smart kitchen assistant. Snap a picture of your ingredients or a
                meal, and let AI guide you with recipes, cooking tips, and personalized suggestions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 justify-center lg:justify-start">
                <button 
                  onClick={handleTryMealLensAI}
                  className="bg-white text-red-500 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  Try MealLensAI Now For Free!
                </button>
                <a 
                  href="#features"
                  className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-500 transition-colors text-center text-sm sm:text-base"
                >
                  Explore Features
                </a>
              </div>
            </div>
            <div className="flex justify-center order-first lg:order-last">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="rounded-lg shadow-2xl w-full max-w-md lg:max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              >
                <source src="/assets/okay.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3436] mb-4">Our Features</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Discover why MealLensAI is the ultimate kitchen companion.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center p-6 sm:p-8 rounded-2xl shadow-sm border border-[#e2e8f0] bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <span className="text-2xl sm:text-3xl">📷</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3436] mb-3 sm:mb-4">Smart Ingredient Recognition</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Snap a picture or upload an image of your ingredients, and let MealLensAI
                identify them instantly using cutting-edge AI technology.
              </p>
            </div>
            
            <div className="text-center p-6 sm:p-8 rounded-2xl shadow-sm border border-[#e2e8f0] bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <span className="text-2xl sm:text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3436] mb-3 sm:mb-4">Recipe Suggestions & AI Review</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Discover recipes based on your ingredients, get quick meal ideas, and missing ingredients.
                Also snap your finished dish, and let AI score how well you made it.
              </p>
            </div>
            
            <div className="text-center p-6 sm:p-8 rounded-2xl shadow-sm border border-[#e2e8f0] bg-white hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <span className="text-2xl sm:text-3xl">🔍</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3436] mb-3 sm:mb-4">Smart Food Detection</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Capture a photo of any prepared meal, and let our AI identify the dish and provide
                the full recipe with ingredient list and step-by-step cooking instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/assets/images/pics1.png" 
                alt="About MealLensAI" 
                className="rounded-2xl shadow-lg w-full h-auto max-w-lg mx-auto lg:max-w-full"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3436] mb-4 sm:mb-6">
                Transform Your Culinary Experience!
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                MealLensAI is your ultimate kitchen companion. Whether you're a seasoned chef or a
                curious beginner, MealLensAI empowers you to identify ingredients, explore new
                recipes, and plan meals effortlessly.
              </p>
              <button 
                onClick={handleTryMealLensAI}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Try MealLensAI Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3436] mb-4 sm:mb-6">
            Join Our Mobile App Waitlist Today!
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Be among the first to experience our app—join the waitlist today!
          </p>
          <a 
            href="https://forms.gle/aUnxiV1Rhx8yhjCz7"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 inline-block text-sm sm:text-base"
          >
            Join Waitlist
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Stay Updated with MealLensAI</h3>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-lg">
              <input 
                type="email" 
                placeholder="Enter Your Email..." 
                className="flex-1 px-4 py-3 text-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
              />
              <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 sm:px-6 py-3 hover:from-pink-600 hover:to-orange-600 transition-all duration-300 font-semibold text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm sm:text-base">© 2024 MealLensAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 