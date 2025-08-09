import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  onClick
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

  return (
    <div 
      className={`flex items-center gap-2 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <img 
          src="/assets/images/image.png" 
          alt="MealLensAI Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`font-semibold text-pink-400 ${textSizes[size]}`}>
          meallensai
        </span>
      )}
    </div>
  );
};

export default Logo; 