import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Rocket, Mail } from 'lucide-react';

interface LaunchCountdownProps {
  onLaunchComplete: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LaunchCountdown: React.FC<LaunchCountdownProps> = ({ onLaunchComplete }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLaunched, setIsLaunched] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Launch date - set this to your desired launch date
  const LAUNCH_DATE = new Date('2024-12-25T00:00:00Z'); // Christmas 2024 as example

  // Get server time to prevent clock manipulation
  const getServerTime = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://meallens-ai.onrender.com'}/api/server-time`);
      const data = await response.json();
      return new Date(data.serverTime);
    } catch (error) {
      console.error('Failed to get server time, using local time:', error);
      return new Date();
    }
  };

  // Calculate time difference
  const calculateTimeLeft = (currentTime: Date): TimeLeft => {
    const difference = LAUNCH_DATE.getTime() - currentTime.getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Handle email subscription
  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      return;
    }
    
    try {
      // Here you would typically send the email to your backend
      // For now, we'll just simulate success
      setIsSubscribed(true);
      localStorage.setItem('meallens-waitlist-email', email);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  useEffect(() => {
    const initializeCountdown = async () => {
      const currentServerTime = await getServerTime();
      setServerTime(currentServerTime);
      
      const initialTimeLeft = calculateTimeLeft(currentServerTime);
      setTimeLeft(initialTimeLeft);
      
      // Check if launch time has passed
      if (initialTimeLeft.days === 0 && initialTimeLeft.hours === 0 && 
          initialTimeLeft.minutes === 0 && initialTimeLeft.seconds === 0) {
        setIsLaunched(true);
        onLaunchComplete();
        return;
      }
    };

    initializeCountdown();

    // Update countdown every second
    const timer = setInterval(async () => {
      const currentTime = await getServerTime();
      const newTimeLeft = calculateTimeLeft(currentTime);
      setTimeLeft(newTimeLeft);
      
      // Check if launch time has passed
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsLaunched(true);
        onLaunchComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onLaunchComplete]);

  // Check if user was already subscribed
  useEffect(() => {
    const savedEmail = localStorage.getItem('meallens-waitlist-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsSubscribed(true);
    }
  }, []);

  if (isLaunched) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] via-[#FF8E8E] to-[#FF5252] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            {/* Logo */}
            <div className="mb-8">
              <Logo size="xl" showText={true} />
            </div>

            {/* Launch Message */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Coming Soon!
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                MealLensAI is launching in
              </p>
              <p className="text-lg text-gray-500">
                {LAUNCH_DATE.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-lg p-4 text-white">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.days}</div>
                <div className="text-sm opacity-90">Days</div>
              </div>
              <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-lg p-4 text-white">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</div>
                <div className="text-sm opacity-90">Hours</div>
              </div>
              <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-lg p-4 text-white">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</div>
                <div className="text-sm opacity-90">Minutes</div>
              </div>
              <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-lg p-4 text-white">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</div>
                <div className="text-sm opacity-90">Seconds</div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What's Coming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📷</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Smart Food Detection</h3>
                  <p className="text-sm text-gray-600">AI-powered ingredient recognition</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Recipe Suggestions</h3>
                  <p className="text-sm text-gray-600">Personalized meal recommendations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Meal Planning</h3>
                  <p className="text-sm text-gray-600">Weekly meal organization</p>
                </div>
              </div>
            </div>

            {/* Email Subscription */}
            {!isSubscribed ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Get Early Access
                </h3>
                <p className="text-gray-600 mb-4">
                  Be the first to know when we launch and get exclusive early access!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                  />
                  <Button
                    onClick={handleSubscribe}
                    disabled={!email || !email.includes('@')}
                    className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center text-green-800">
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="font-semibold">You're on the list!</span>
                  </div>
                  <p className="text-sm text-green-700 text-center mt-1">
                    We'll notify you as soon as we launch.
                  </p>
                </div>
              </div>
            )}

            {/* Server Time Display (for debugging) */}
            {serverTime && (
              <div className="text-xs text-gray-400 mt-4">
                Server time: {serverTime.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchCountdown; 