import React from 'react';
import Logo from '@/components/Logo';

interface LoadingScreenProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="xl" showText={true} />
        </div>
        
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className={`${sizeClasses[size]} relative`}>
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF6B6B] animate-spin"></div>
            
            {/* Inner circle */}
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 