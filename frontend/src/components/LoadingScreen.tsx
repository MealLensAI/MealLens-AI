import React from 'react';

interface LoadingScreenProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64'
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Simple horizontal line animation */}
        <div className={`${sizeClasses[size]} h-1 bg-gray-200 rounded-full overflow-hidden`}>
          <div className="h-full bg-[#FF6B6B] rounded-full animate-pulse" 
               style={{
                 animation: 'loading 1.5s ease-in-out infinite',
                 background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E8E 50%, #FF6B6B 100%)',
                 backgroundSize: '200% 100%'
               }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 