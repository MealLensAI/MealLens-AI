// API Configuration
export const API_CONFIG = {
  // Main backend API (for user management, meal plans, etc.)
  MAIN_API_URL: import.meta.env.VITE_API_URL || 'https://meallens-ai.onrender.com',
  
  // AI processing backend (for food detection, meal planning, etc.)
  AI_API_URL: import.meta.env.VITE_AI_API_URL || 'https://ai-utu2.onrender.com',
  
  // Local development fallback
  LOCAL_API_URL: 'http://127.0.0.1:5001',
}

// API Endpoints
export const API_ENDPOINTS = {
  // Main API endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/profile',
  MEAL_PLANS: '/api/meal_plans',
  DETECTION_HISTORY: '/api/detection_history',
  SESSIONS: '/api/sessions',
  PAYMENTS: '/api/payments',
  
  // AI API endpoints
  SMART_PLAN: `${API_CONFIG.AI_API_URL}/smart_plan`,
  AUTO_GENERATE_PLAN: `${API_CONFIG.AI_API_URL}/auto_generate_plan`,
  AUTO_SICK_SMART_PLAN: `${API_CONFIG.AI_API_URL}/auto_sick_smart_plan`,
  PROCESS: `${API_CONFIG.AI_API_URL}/process`,
  INSTRUCTIONS: `${API_CONFIG.AI_API_URL}/instructions`,
  RESOURCES: `${API_CONFIG.AI_API_URL}/resources`,
  FOOD_DETECT: `${API_CONFIG.AI_API_URL}/food_detect`,
  FOOD_DETECT_RESOURCES: `${API_CONFIG.AI_API_URL}/food_detect_resources`,
  MEAL_PLAN_INSTRUCTIONS: `${API_CONFIG.AI_API_URL}/meal_plan_instructions`,
  
  // Sickness-specific endpoints
  SICK_SMART_PLAN: `${API_CONFIG.MAIN_API_URL}/sick_smart_plan`,
  SICK_MEAL_PLAN_INSTRUCTIONS: `${API_CONFIG.MAIN_API_URL}/sick_meal_plan_instructions`,
}

// Environment detection
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_SICKNESS_FEATURES: true,
  ENABLE_PAYMENTS: true,
  ENABLE_ANALYTICS: isProduction,
}
