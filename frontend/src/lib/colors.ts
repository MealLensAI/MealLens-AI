// MealLens AI Official Color Palette
export const COLORS = {
  // Primary Brand Colors
  primary: {
    orange: '#FF6B6B',      // Main orange
    orangeHover: '#FF5252', // Darker orange for hover
    orangeLight: '#FF8E53', // Lighter orange variant
  },
  
  // Neutral Colors
  neutral: {
    black: '#000000',       // Pure black
    white: '#FFFFFF',       // Pure white
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    }
  },
  
  // Status Colors
  status: {
    success: '#10B981',     // Green
    warning: '#F59E0B',     // Yellow
    error: '#EF4444',       // Red
    info: '#3B82F6',        // Blue
  }
} as const;

// Utility functions for consistent color usage
export const getColorClasses = {
  // Primary buttons
  primaryButton: 'bg-orange-500 hover:bg-orange-600 text-white',
  primaryButtonOutline: 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
  
  // Secondary buttons
  secondaryButton: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  secondaryButtonOutline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
  
  // Text colors
  primaryText: 'text-orange-500',
  secondaryText: 'text-gray-600',
  mutedText: 'text-gray-500',
  
  // Background colors
  primaryBg: 'bg-orange-500',
  primaryBgLight: 'bg-orange-50',
  secondaryBg: 'bg-gray-50',
  
  // Border colors
  primaryBorder: 'border-orange-500',
  secondaryBorder: 'border-gray-200',
} as const;

// Replace old color references
export const replaceOldColors = (className: string): string => {
  return className
    .replace(/bg-\[#FF6B6B\]/g, 'bg-orange-500')
    .replace(/hover:bg-\[#FF5252\]/g, 'hover:bg-orange-600')
    .replace(/hover:bg-\[#FF8E53\]/g, 'hover:bg-orange-400')
    .replace(/text-\[#FF6B6B\]/g, 'text-orange-500')
    .replace(/border-\[#FF6B6B\]/g, 'border-orange-500')
    .replace(/bg-\[#FF6B6B\]\/10/g, 'bg-orange-50')
    .replace(/border-\[#FF6B6B\]\/20/g, 'border-orange-200')
    .replace(/text-\[#FF6B6B\]/g, 'text-orange-500');
}; 