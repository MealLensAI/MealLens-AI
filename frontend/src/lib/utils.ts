import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api, APIError } from './api'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for merging class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Constants
const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_data'

// User interface
export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string | null
  role?: string
  created_at?: string
}

// Auth context interface
interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearSession: () => void
}

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider hook
export const useProvideAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Clear session data
  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('supabase_refresh_token')
    localStorage.removeItem('supabase_session_id')
    localStorage.removeItem('supabase_user_id')
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    clearSession()
    window.location.href = '/login'
  }, [clearSession])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await api.login({ email, password })
      if (result.status === 'success' && result.access_token) {
        // Store the token and user data
        localStorage.setItem(TOKEN_KEY, result.access_token)
        localStorage.setItem('supabase_refresh_token', result.refresh_token || '')
        localStorage.setItem('supabase_session_id', result.session_id || '')
        localStorage.setItem('supabase_user_id', result.user_id || '')
          
        // Store user data
        const userData = {
          uid: result.user_id || '',
          email: email,
          displayName: result.name || email.split('@')[0],
          photoURL: null,
          role: result.user_role || 'user'
        }

        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        
        // Update state
        setToken(result.access_token)
        setUser(userData)
        
        return result
      } else {
        throw new Error(result.message || 'Login failed')
      }
    } catch (error) {
      console.error('[AUTH] Login error:', error)
      throw error
    }
  }, [])

  // Refresh authentication state
  const refreshAuth = useCallback(async () => {
    console.log('[AUTH] Starting refreshAuth...')
    setLoading(true)
    try {
      // Check if we have a stored token (from backend login)
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUserData = localStorage.getItem(USER_KEY)
      const refreshToken = localStorage.getItem('supabase_refresh_token')
      
      console.log('[AUTH] Stored data:', { 
        hasToken: !!storedToken, 
        hasUserData: !!storedUserData, 
        hasRefreshToken: !!refreshToken 
      })
      
      if (storedToken && storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData)
          
          // First, try to validate the current token by fetching profile
          try {
            setToken(storedToken)
            setUser(parsedUser as User)
            
            const profileResponse = await api.getUserProfile()
            
            if (profileResponse.status === 'success' && profileResponse.data) {
              const profile = profileResponse.data
              const updatedUser: User = {
                uid: profile.id,
                email: profile.email,
                displayName: profile.display_name,
                photoURL: undefined,
                role: profile.role || parsedUser.role || 'user', // Preserve role from login
                created_at: profile.created_at || undefined
              }

              setUser(updatedUser)
              // Update stored user data
              localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
              setLoading(false)
              return
            }
          } catch (profileError) {
            // If current token is invalid, try to refresh using refresh token
            if (refreshToken) {
              try {
                const refreshResponse = await api.refreshToken({ refresh_token: refreshToken })
                
                if (refreshResponse.status === 'success' && refreshResponse.access_token) {
                  // Update stored tokens
                  localStorage.setItem(TOKEN_KEY, refreshResponse.access_token)
                  localStorage.setItem('supabase_refresh_token', refreshResponse.refresh_token || refreshToken)
                  
                  // Update auth state with new token
                  setToken(refreshResponse.access_token)
                  setUser(parsedUser as User)
                  
                  // Try to fetch profile with new token
                  const newProfileResponse = await api.getUserProfile()
                  
                  if (newProfileResponse.status === 'success' && newProfileResponse.data) {
                    const profile = newProfileResponse.data
                    const updatedUser: User = {
                      uid: profile.id,
                      email: profile.email,
                      displayName: profile.display_name,
                      photoURL: undefined,
                      role: profile.role || parsedUser.role || 'user', // Preserve role from login
                      created_at: profile.created_at || undefined
                    }
                    setUser(updatedUser)
                    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
                    setLoading(false)
                    console.log('[AUTH] Profile fetch with new token successful')
                    return
                  }
                } else {
                  console.error('[AUTH] Token refresh failed:', refreshResponse)
                }
              } catch (refreshError) {
                console.error('[AUTH] Token refresh failed:', refreshError)
              }
            } else {
              console.log('[AUTH] No refresh token available')
            }
            
            // If refresh failed or no refresh token, clear session
            console.log('[AUTH] Unable to refresh token, clearing session')
            clearSession()
            setLoading(false)
            return
          }
          
          setLoading(false)
          return
        } catch (error) {
          console.error('[AUTH] Error parsing stored user data:', error)
          // Clear invalid data
          clearSession()
          setLoading(false)
          return
        }
      }

      // No valid token found, user is not authenticated
      console.log('[AUTH] No valid token found, user not authenticated')
      setToken(null)
      setUser(null)
      setLoading(false)
    } catch (error) {
      console.error('[AUTH] Error in refreshAuth:', error)
      // On error, check if we have stored data to fall back to
      const fallbackToken = localStorage.getItem(TOKEN_KEY)
      const fallbackUserData = localStorage.getItem(USER_KEY)
      
      if (fallbackToken && fallbackUserData) {
        try {
          const parsedUser = JSON.parse(fallbackUserData)
          setToken(fallbackToken)
          setUser(parsedUser as User)
          console.log('[AUTH] Fallback to stored token on error')
        } catch (parseError) {
          console.error('[AUTH] Error parsing stored user data on fallback:', parseError)
      clearSession()
        }
      } else {
        setToken(null)
        setUser(null)
      }
      setLoading(false)
    }
  }, [clearSession])

  // Initialize auth state
  useEffect(() => {
    // Add a small delay to prevent immediate auth loops
    const timer = setTimeout(() => {
    refreshAuth()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [refreshAuth])

  // Set up periodic token refresh (every 45 minutes to refresh before 1-hour expiration)
  useEffect(() => {
    if (!token) return

    const refreshInterval = setInterval(async () => {
      console.log('[AUTH] Periodic token refresh check...')
      const refreshToken = localStorage.getItem('supabase_refresh_token')
      
      if (refreshToken) {
        try {
          console.log('[AUTH] Attempting periodic token refresh...')
          const refreshResponse = await api.refreshToken({ refresh_token: refreshToken })
          
          if (refreshResponse.status === 'success' && refreshResponse.access_token) {
            console.log('[AUTH] Periodic token refresh successful')
            localStorage.setItem(TOKEN_KEY, refreshResponse.access_token)
            localStorage.setItem('supabase_refresh_token', refreshResponse.refresh_token || refreshToken)
            setToken(refreshResponse.access_token)
          } else {
            console.log('[AUTH] Periodic token refresh failed, will retry on next API call')
          }
        } catch (error) {
          console.error('[AUTH] Periodic token refresh error:', error)
        }
      }
    }, 45 * 60 * 1000) // 45 minutes

    return () => clearInterval(refreshInterval)
  }, [token])

  // Listen for storage changes (e.g., login in another tab)
  useEffect(() => {
    const handleStorage = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUserData = localStorage.getItem(USER_KEY)
      
      if (storedToken && storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData)
          setToken(storedToken)
          setUser(parsedUser as User)
        } catch (error) {
          console.error('Error parsing user data from storage:', error)
          clearSession()
        }
      } else {
        clearSession()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [clearSession])

  // Listen for user activity to refresh token if needed
  useEffect(() => {
    if (!token) return

    let lastActivity = Date.now()
    let activityTimeout: NodeJS.Timeout

    const handleUserActivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      
      // If user was inactive for more than 30 minutes, refresh token
      if (timeSinceLastActivity > 30 * 60 * 1000) {
        console.log('[AUTH] User became active after inactivity, checking token...')
        const refreshToken = localStorage.getItem('supabase_refresh_token')
        
        if (refreshToken) {
          api.refreshToken({ refresh_token: refreshToken })
            .then(refreshResponse => {
              if (refreshResponse.status === 'success' && refreshResponse.access_token) {
                console.log('[AUTH] Token refreshed after user activity')
                localStorage.setItem(TOKEN_KEY, refreshResponse.access_token)
                localStorage.setItem('supabase_refresh_token', refreshResponse.refresh_token || refreshToken)
                setToken(refreshResponse.access_token)
              }
            })
            .catch(error => {
              console.error('[AUTH] Token refresh after activity failed:', error)
            })
        }
      }
      
      lastActivity = now
      
      // Clear existing timeout and set new one
      clearTimeout(activityTimeout)
      activityTimeout = setTimeout(() => {
        console.log('[AUTH] User inactive for 30 minutes')
      }, 30 * 60 * 1000)
    }

    // Listen for various user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
      clearTimeout(activityTimeout)
    }
  }, [token])

  const isAuthenticated = !!token && !!user

  return { 
    user, 
    token, 
    loading, 
    isAuthenticated, 
    refreshAuth, 
    logout, 
    clearSession,
    login 
  }
}

// Utility function to handle 401 errors and logout
export const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    // Don't clear session data immediately, let the auth context handle it
    console.log('[AUTH] 401 error in handleAuthError - letting auth context handle')
    throw new Error('Authentication required. Please log in again.')
  }
}
