import React from 'react';
import Logo from './Logo';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  showProgress?: boolean;
  progress?: number;
  variant?: 'default' | 'inline' | 'button';
}

/**
 * Universal Loading Screen Component
 * 
 * This is the ONLY loading component used throughout the app for consistency.
 * 
 * @param message - Main loading message
 * @param subMessage - Secondary/subtitle message
 * @param showLogo - Whether to show the app logo
 * @param size - Size of the loading spinner ('sm', 'md', 'lg', 'xl')
 * @param fullScreen - Whether to render as full-screen overlay
 * @param showProgress - Whether to show progress bar
 * @param progress - Progress percentage (0-100)
 * @param variant - Loading variant ('default', 'inline', 'button')
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  subMessage,
  showLogo = true,
  size = 'lg',
  fullScreen = true,
  showProgress = false,
  progress = 0,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinnerSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Inline variant for buttons and small spaces
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className={`relative ${sizeClasses.sm}`}>
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 w-4 h-4"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 border-r-orange-500 animate-spin w-4 h-4"></div>
        </div>
        {message && (
          <span className="text-sm text-gray-600">{message}</span>
        )}
      </div>
    );
  }

  // Button variant for loading buttons
  if (variant === 'button') {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
        </div>
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Logo */}
      {showLogo && (
        <div className="animate-pulse">
          <Logo className="w-16 h-16" />
        </div>
      )}

      {/* Spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`absolute inset-0 rounded-full border-4 border-gray-200 ${spinnerSizeClasses[size]}`}></div>
        <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-orange-500 animate-spin ${spinnerSizeClasses[size]}`}></div>
      </div>

      {/* Messages */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {message}
        </h3>
        {subMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            {subMessage}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Animated Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-6">
        {content}
      </div>
    </div>
  );
};

export default LoadingScreen; 