import { useAuth } from './utils'

// API base URL - uses environment variable or falls back to proxy
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : (import.meta.env.DEV ? '/api' : 'https://meallens-ai-cmps.onrender.com/api')

// Debug logging
console.log('[API] Environment:', import.meta.env.MODE)
console.log('[API] VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('[API] Final API_BASE_URL:', API_BASE_URL)

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Response wrapper type
export interface APIResponse<T = any> {
  status: 'success' | 'error'
  message?: string
  data?: T
}

// Specific response types
export interface MealPlansResponse {
  status: 'success' | 'error'
  message?: string
  meal_plans?: any[]
}

export interface ProfileResponse {
  status: 'success' | 'error'
  message?: string
  profile?: any
}

export interface DetectionHistoryResponse {
  status: 'success' | 'error'
  message?: string
  data?: any
}

// Request options type
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  skipAuth?: boolean
  timeout?: number
}

// Centralized API service
class APIService {
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token')
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      skipAuth = false,
      timeout = 60000  // Increased to 60 seconds for cold starts
    } = options

    // Add auth header if not skipped
    if (!skipAuth) {
      const token = this.getAuthToken()
      if (!token) {
        // Don't redirect immediately, let the auth context handle it
        throw new APIError('No authentication token found. Please log in again.', 401)
      }
      headers['Authorization'] = `Bearer ${token}`
    }

    // Add default headers
    if (body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // Prepare request config
    const config: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout)
    }

    // Add body if present
    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`
      console.log("[API] Making request to:", fullUrl);
      console.log("[API] Request method:", method);
      console.log("[API] Request headers:", headers);
      console.log("[API] Request body:", body);
      console.log("[API] Config body:", config.body);
      
      const response = await fetch(fullUrl, config)
      
      console.log("[API] Response status:", response.status);
      console.log("[API] Response headers:", Object.fromEntries(response.headers.entries()));
      
      // Handle different response types
      const contentType = response.headers.get('content-type')
      let data: any

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
      
      console.log("[API] Response data:", data);

      // Handle HTTP errors
      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          // Don't clear session data immediately, let the auth context handle token refresh
          console.log('[API] 401 Unauthorized - letting auth context handle refresh')
          throw new APIError('Authentication required. Please log in again.', 401)
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
          throw new APIError('Access denied. You do not have permission to perform this action.', 403)
        }

        // Handle 404 Not Found
        if (response.status === 404) {
          throw new APIError('Resource not found. Please check the URL and try again.', 404)
        }

        // Handle 500+ server errors with better fallback messages
        if (response.status >= 500) {
          console.error(`Server error ${response.status}:`, data)
          
          // Provide user-friendly fallback messages based on endpoint
          let fallbackMessage = 'Server error. Please try again later.'
          if (endpoint.includes('detection_history')) {
            fallbackMessage = 'Unable to load detection history. Please try again later.'
          } else if (endpoint.includes('meal_plan')) {
            fallbackMessage = 'Unable to save/load meal plans. Please try again later.'
          } else if (endpoint.includes('feedback')) {
            fallbackMessage = 'Unable to save feedback. Please try again later.'
          }
          
          throw new APIError(fallbackMessage, response.status, data)
        }

        // Handle other client errors
        const errorMessage = data?.message || data || `HTTP ${response.status}: ${response.statusText}`
        throw new APIError(errorMessage, response.status, data)
      }

      return data
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new APIError('Network error. Please check your connection and try again.', 0)
      }

      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new APIError('Request timeout. Please try again.', 0)
      }

      // Re-throw API errors
      if (error instanceof APIError) {
        throw error
      }

      // Handle other errors
      throw new APIError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0)
    }
  }

  // Generic request methods
  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  // Auth-specific methods
  async login(credentials: { email: string; password: string }): Promise<APIResponse> {
    return this.post('/login', credentials, { skipAuth: true })
  }

  async register(userData: { email: string; password: string; first_name: string; last_name: string }): Promise<APIResponse> {
    return this.post('/register', userData, { skipAuth: true })
  }

  async refreshToken(tokenData: { refresh_token: string }): Promise<APIResponse> {
    return this.post('/refresh-token', tokenData, { skipAuth: true })
  }

  // Profile methods
  async getUserProfile(): Promise<ProfileResponse> {
    return this.get('/profile')
  }

  async updateUserProfile(profileData: any): Promise<ProfileResponse> {
    return this.put('/profile', profileData)
  }

  // Settings methods (Flask backend) - Sickness settings moved to profile

  async getAllSettings(): Promise<APIResponse> {
    return this.get('/settings')
  }

  // Meal plan methods (Flask backend)
  async getMealPlansFromFlask(): Promise<MealPlansResponse> {
    try {
      return await this.get('/meal_plan')
    } catch (error) {
      console.warn('Meal plans API error (normal for new users):', error);
      return { status: 'success', meal_plans: [] }
    }
  }

  async saveMealPlanToFlask(planData: any): Promise<APIResponse> {
    return this.post('/meal_plan', planData)
  }

  async updateMealPlanInFlask(id: string, planData: any): Promise<APIResponse> {
    return this.put(`/meal_plans/${id}`, planData)
  }

  async deleteMealPlanFromFlask(id: string): Promise<APIResponse> {
    return this.delete(`/meal_plans/${id}`)
  }

  async clearAllMealPlansFromFlask(): Promise<APIResponse> {
    return this.delete('/meal_plans/clear')
  }

  // Food detection methods (Flask backend)
  async saveDetectionHistory(detectionData: any): Promise<DetectionHistoryResponse> {
    console.log("[API] saveDetectionHistory called with data:", detectionData);
    console.log("[API] Making POST request to /food_detection/detection_history");
    const result = await this.post('/food_detection/detection_history', detectionData);
    console.log("[API] saveDetectionHistory response:", result);
    
    // After saving detection history, ensure usage is recorded in backend
    try {
      const featureName = detectionData.recipe_type === 'food_detection' ? 'food_detection' : 'ingredient_detection';
      await this.post(`/payment/record-usage/${featureName}`, {
        feature: featureName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to record usage after saving detection history:', error);
    }
    
    return result;
  }

  async updateDetectionHistoryWithResources(updateData: any): Promise<DetectionHistoryResponse> {
    return this.post('/food_detection/update_resources', updateData)
  }

  async getDetectionHistory(page: number = 1, limit: number = 10): Promise<DetectionHistoryResponse> {
    console.log("🔍 [API] getDetectionHistory called")
    const result = await this.get(`/food_detection/detection_history?page=${page}&limit=${limit}`)
    console.log("🔍 [API] getDetectionHistory result:", result)
    return result
  }



  // Session methods (Flask backend)
  async saveSession(sessionData: any): Promise<APIResponse> {
    return this.post('/session', sessionData)
  }

  async getSession(sessionId: string): Promise<APIResponse> {
    return this.get(`/session/${sessionId}`)
  }

  async updateSession(sessionId: string, sessionData: any): Promise<APIResponse> {
    return this.put(`/session/${sessionId}`, sessionData)
  }

  async getAllSessions(): Promise<APIResponse> {
    return this.get('/session')
  }

  // AI Session methods (Flask backend)
  async storeAISession(sessionData: any): Promise<APIResponse> {
    return this.post('/store-session', sessionData)
  }

  // Payment methods (Flask backend)
  async getPaymentPlans(): Promise<APIResponse> {
    return this.get('/payment/plans')
  }

  async getPaymentSubscription(): Promise<APIResponse> {
    return this.get('/payment/subscription')
  }

  async getPaymentUsage(): Promise<APIResponse> {
    return this.get('/payment/usage')
  }

  async checkPaymentUsage(service: string): Promise<APIResponse> {
    return this.get(`/payment/check-usage/${service}`)
  }

  async initializePayment(paymentData: any): Promise<APIResponse> {
    return this.post('/payment/initialize-payment', paymentData)
  }

  async verifyPayment(reference: string): Promise<APIResponse> {
    return this.get(`/payment/verify-payment/${reference}`)
  }

  async cancelSubscription(): Promise<APIResponse> {
    return this.post('/payment/cancel-subscription')
  }

  async upgradeSubscription(upgradeData: any): Promise<APIResponse> {
    return this.post('/payment/upgrade-subscription', upgradeData)
  }

  // External AI services (these don't use our auth token)
  async smartPlan(input: string | FormData): Promise<any> {
    if (typeof input === 'string') {
      return this.post('https://ai-utu2.onrender.com/smart_plan', { ingredients: input }, { skipAuth: true })
    } else {
      return this.post('https://ai-utu2.onrender.com/smart_plan', input, { skipAuth: true })
    }
  }

  async processAI(formData: FormData): Promise<any> {
    return this.post('https://ai-utu2.onrender.com/process', formData, { skipAuth: true })
  }

  async getInstructions(formData: FormData): Promise<any> {
    return this.post('https://ai-utu2.onrender.com/instructions', formData, { skipAuth: true })
  }

  async getResources(formData: FormData): Promise<any> {
    return this.post('https://ai-utu2.onrender.com/resources', formData, { skipAuth: true })
  }

  async detectFood(image: File): Promise<any> {
    const formData = new FormData()
    formData.append('image', image)
    return this.post('https://ai-utu2.onrender.com/food_detect', formData, { 
      skipAuth: true,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async getFoodDetectResources(foodDetected: string): Promise<any> {
    return this.post('https://ai-utu2.onrender.com/food_detect_resources', { food_detected: foodDetected }, { skipAuth: true })
  }

  async getImage(prompt: string): Promise<any> {
    return this.post('https://get-images-qa23.onrender.com/image', { prompt }, { skipAuth: true })
  }

  // Proxy method for external URLs
  async proxyRequest(url: string): Promise<any> {
    const proxyUrl = '/api/proxy?url='
    return this.get(proxyUrl + encodeURIComponent(url), { skipAuth: true })
  }

  // Admin methods
  async getAdminUsers(params?: any): Promise<APIResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/admin/users${queryString}`)
  }

  async getAdminSubscriptionSummary(): Promise<APIResponse> {
    return this.get('/admin/subscriptions/summary')
  }

  async getAdminRevenueMetrics(params?: any): Promise<APIResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/admin/metrics/revenue${queryString}`)
  }

  async getAdminUsageMetrics(params?: any): Promise<APIResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/admin/metrics/usage${queryString}`)
  }

  async getAdminUserDetails(userId: string): Promise<APIResponse> {
    return this.get(`/admin/users/${userId}/details`)
  }

  async updateAdminSubscription(subscriptionId: string, data: any): Promise<APIResponse> {
    return this.put(`/admin/subscriptions/${subscriptionId}/update`, data)
  }

  async cancelAdminSubscription(subscriptionId: string): Promise<APIResponse> {
    return this.post(`/admin/subscriptions/${subscriptionId}/cancel`)
  }
}

// Create singleton instance
export const api = new APIService()