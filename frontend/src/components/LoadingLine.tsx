import React from 'react';

interface LoadingLineProps {
  className?: string;
}

const LoadingLine: React.FC<LoadingLineProps> = ({ className = '' }) => {
  return (
    <div className={`fixed top-0 left-0 w-full z-50 ${className}`}>
      <div className="h-1 bg-orange-500">
        <div 
          className="h-full bg-orange-400 animate-pulse"
          style={{
            animation: 'loading 2s ease-in-out infinite'
          }}
        ></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingLine; 