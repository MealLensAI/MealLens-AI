import { useAuth } from './utils'

// API base URL - always use remote backend for now
const API_BASE_URL = 'https://meallens-ai-cmps.onrender.com/api'

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
      timeout = 90000  // Increased to 90 seconds for mobile networks
    } = options

    const fullUrl = `${API_BASE_URL}${endpoint}`
    console.log('[API] Making request to:', fullUrl)
    console.log('[API] Request method:', method)
    console.log('[API] Request headers:', headers)
    console.log('[API] Request body:', body)
    console.log('[API] Config body:', JSON.stringify(body))

    // Add auth header if not skipped
    if (!skipAuth) {
      const token = this.getAuthToken()
      if (!token) {
        // Clear any stale data and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('supabase_refresh_token')
        localStorage.removeItem('supabase_session_id')
        localStorage.removeItem('supabase_user_id')
        window.location.href = '/login'
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
      headers
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    config.signal = controller.signal

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      console.log(`[API] Response status: ${response.status}`)
      console.log(`[API] Response headers:`, Object.fromEntries(response.headers.entries()))

      // Clear timeout
      clearTimeout(timeoutId)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.log(`[API] Non-JSON response:`, text)
        throw new APIError(`Unexpected response format: ${text}`, response.status)
      }

      const data = await response.json()
      console.log(`[API] Response data:`, data)

      if (!response.ok) {
        throw new APIError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        )
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof APIError) {
        throw error
      }

      if (error.name === 'AbortError') {
        throw new APIError('Request timeout. Please check your connection and try again.', 408)
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new APIError('Network error. Please check your connection and try again.', 0)
      }
      
      console.error(`[API] Request failed:`, error)
      throw new APIError('An unexpected error occurred. Please try again.', 500)
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }): Promise<any> {
    console.log('[API] Login attempt for:', credentials.email)
    try {
      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
        timeout: 120000  // 2 minutes for login requests (cold start can be slow)
      })
      console.log('[API] Login response:', response)
      return response
    } catch (error) {
      console.error('[API] Login error:', error)
      throw error
    }
  }

  async register(userData: any): Promise<any> {
    return this.makeRequest('/register', {
      method: 'POST',
      body: userData,
      skipAuth: true
    })
  }

  async refreshToken(data: { refresh_token: string }): Promise<any> {
    return this.makeRequest('/refresh-token', {
      method: 'POST',
      body: data,
      skipAuth: true
    })
  }

  async getUserProfile(): Promise<any> {
    return this.makeRequest('/profile')
  }

  async updateUserProfile(profileData: any): Promise<any> {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: profileData
    })
  }

  // Food detection endpoints
  async detectFood(imageFile: File): Promise<any> {
    const formData = new FormData()
    formData.append('image', imageFile)

    return this.makeRequest('/food_detection/detect', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async getDetectionHistory(page: number = 1, limit: number = 10): Promise<any> {
    return this.makeRequest(`/food_detection/detection_history?page=${page}&limit=${limit}`)
  }

  async saveDetectionHistory(detectionData: any): Promise<any> {
    return this.makeRequest('/food_detection/detection_history', {
      method: 'POST',
      body: detectionData
    })
  }

  // Meal planning endpoints
  async generateMealPlan(planData: any): Promise<any> {
    return this.makeRequest('/meal_plan/generate', {
      method: 'POST',
      body: planData
    })
  }

  async getMealPlans(): Promise<any> {
    return this.makeRequest('/meal_plan')
  }

  async saveMealPlan(planData: any): Promise<any> {
    return this.makeRequest('/meal_plan', {
      method: 'POST',
      body: planData
    })
  }

  async updateMealPlan(id: string, planData: any): Promise<any> {
    return this.makeRequest(`/meal_plan/${id}`, {
      method: 'PUT',
      body: planData
    })
  }

  async deleteMealPlan(id: string): Promise<any> {
    return this.makeRequest(`/meal_plan/${id}`, {
      method: 'DELETE'
    })
  }

  // AI session endpoints
  async startAISession(sessionData: any): Promise<any> {
    return this.makeRequest('/ai_session/start', {
      method: 'POST',
      body: sessionData
    })
  }

  async sendMessage(sessionId: string, message: string): Promise<any> {
    return this.makeRequest(`/ai_session/${sessionId}/message`, {
      method: 'POST',
      body: { message }
    })
  }

  // Feedback endpoints
  async submitFeedback(feedbackData: any): Promise<any> {
    return this.makeRequest('/feedback', {
      method: 'POST',
      body: feedbackData
    })
  }

  // Settings endpoints
  async getSettings(): Promise<any> {
    return this.makeRequest('/settings')
  }

  async updateSettings(settingsData: any): Promise<any> {
    return this.makeRequest('/settings', {
      method: 'PUT',
      body: settingsData
    })
  }

  // Payment endpoints
  async initializePayment(paymentData: any): Promise<any> {
    return this.makeRequest('/payment/initialize-payment', {
      method: 'POST',
      body: paymentData
    })
  }

  async verifyPayment(reference: string): Promise<any> {
    return this.makeRequest(`/payment/verify-payment/${reference}`)
  }

  async getSubscriptionStatus(): Promise<any> {
    return this.makeRequest('/payment/subscription-status')
  }

  async canUseFeature(featureName: string): Promise<any> {
    return this.makeRequest(`/payment/can-use-feature/${featureName}`)
  }

  // Admin endpoints
  async getAdminUsers(params?: any): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.makeRequest(`/admin/users${queryParams}`)
  }

  async getAdminSubscriptionSummary(): Promise<any> {
    return this.makeRequest('/admin/subscriptions/summary')
  }

  async getAdminRevenueMetrics(period: string = 'monthly'): Promise<any> {
    return this.makeRequest(`/admin/metrics/revenue?period=${period}`)
  }

  async getAdminUsageMetrics(): Promise<any> {
    return this.makeRequest('/admin/metrics/usage')
  }

  async getAdminUserDetails(userId: string): Promise<any> {
    return this.makeRequest(`/admin/users/${userId}/details`)
  }

  async updateAdminSubscription(subscriptionId: string, updateData: any): Promise<any> {
    return this.makeRequest(`/admin/subscriptions/${subscriptionId}/update`, {
      method: 'PUT',
      body: updateData
    })
  }

  async cancelAdminSubscription(subscriptionId: string): Promise<any> {
    return this.makeRequest(`/admin/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST'
    })
  }

  // Public endpoints
  async getUserCount(): Promise<any> {
    return this.makeRequest('/public/user-count', { skipAuth: true })
  }
}

// Export singleton instance
export const api = new APIService()