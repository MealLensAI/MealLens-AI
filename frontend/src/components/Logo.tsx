import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
  variant?: 'full' | 'nav'; // 'full' for auth/landing, 'nav' for navigation
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  onClick,
  variant = 'full'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  const renderLogo = () => {
    if (variant === 'nav') {
      // Navigation logo - abstract dot pattern with transparent background
      return (
        <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
          {/* Abstract dot pattern logo with transparent background */}
          <div className="w-full h-full relative">
            {/* Orange dots */}
            <div className="absolute top-1 left-2 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute top-3 right-1 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
            <div className="absolute top-5 left-1 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute top-6 right-3 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
            <div className="absolute bottom-4 right-2 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute top-2 left-4 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
            <div className="absolute top-6 left-4 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-orange-300 rounded-full"></div>
            <div className="absolute bottom-3 right-1 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
            <div className="absolute bottom-5 right-4 w-1 h-1 bg-orange-300 rounded-full"></div>
            
            {/* Pink dots */}
            <div className="absolute top-1.5 left-3 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute top-3.5 right-2 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute top-5.5 left-2 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute top-6.5 right-1 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-1.5 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-3.5 right-3 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute top-2.5 left-1 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute top-4.5 left-3 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute top-6.5 left-1 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-0.5 left-2 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-2.5 right-4 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-4.5 right-1 w-1 h-1 bg-pink-400 rounded-full"></div>
          </div>
        </div>
      );
    } else {
      // Full logo for auth/landing pages - use logo-2.svg
      return (
        <div className={`${sizeClasses[size]} flex-shrink-0`}>
          <img 
            src="/assets/images/logo-2.svg" 
            alt="MealLensAI Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      {renderLogo()}
      {showText && variant === 'full' && (
        <span className={`font-semibold text-orange-500 ${textSizes[size]}`}>
          MealLens<span className="text-gray-900">AI</span>
        </span>
      )}
    </div>
  );
};

export default Logo; 