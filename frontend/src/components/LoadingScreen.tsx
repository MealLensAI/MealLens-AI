import React from 'react';

interface LoadingScreenProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className={`animate-spin rounded-full border-4 border-gray-200 ${sizeMap[size]} border-t-[#FF6B6B]`} />
    </div>
  );
};

export default LoadingScreen; 