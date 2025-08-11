import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  subMessage,
  showLogo = true,
  size = 'md',
  fullScreen = true
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} bg-gradient-to-br from-red-400 via-red-500 to-orange-500 flex items-center justify-center z-50`}>
      <div className="text-center">
        {/* Logo */}
        {showLogo && (
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">MealLensAI</h1>
            <p className="text-white/80 text-sm">Your Smart Kitchen Assistant</p>
        </div>
        )}
        
        {/* Loading Spinner */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Outer ring */}
            <div className={`${sizeClasses[size]} border-4 border-white/20 rounded-full`}></div>
            
            {/* Spinning ring */}
            <div className={`${sizeClasses[size]} border-4 border-transparent border-t-white rounded-full absolute inset-0 animate-spin`}></div>
            
            {/* Inner pulse */}
            <div className={`${sizeClasses[size]} bg-white/10 rounded-full absolute inset-2 animate-pulse`}></div>
          </div>

          {/* Loading message */}
          <div className="text-center">
            <p className={`text-white font-medium ${textSizes[size]} mb-2`}>
              {message}
            </p>
            {subMessage && (
              <p className="text-white/70 text-sm mb-2">
                {subMessage}
              </p>
            )}
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 