import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { api } from "./api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  refreshAuth: () => Promise<void>
  signOut: () => Promise<void>
  clearSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Token storage keys
const TOKEN_KEY = "access_token"
const USER_KEY = "user_data"

// Pure TypeScript AuthProvider (no JSX)
export function useProvideAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Clear session data
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('supabase_refresh_token')
    localStorage.removeItem('supabase_session_id')
    localStorage.removeItem('supabase_user_id')
    setUser(null)
    setToken(null)
  }, [])

  // Sign out function - Supabase doesn't need explicit sign out call
  const signOut = useCallback(async () => {
    try {
      // Clear all session data
      clearSession()
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear session and redirect
      clearSession()
      window.location.href = '/login'
    }
  }, [clearSession])

  // Refresh authentication state
  const refreshAuth = useCallback(async () => {
    console.log('[AUTH] Starting refreshAuth...')
    setLoading(true)
    try {
      // Check if we have a stored token (from backend login)
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUserData = localStorage.getItem(USER_KEY)
      const refreshToken = localStorage.getItem('supabase_refresh_token')
      
      console.log('[AUTH] Stored token exists:', !!storedToken)
      console.log('[AUTH] Stored user data exists:', !!storedUserData)
      console.log('[AUTH] Refresh token exists:', !!refreshToken)
      
      if (storedToken && storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData)
          
          // First, try to validate the current token by fetching profile
          try {
            console.log('[AUTH] Attempting to validate current token...')
            setToken(storedToken)
            setUser(parsedUser as User)
            
            const profileResponse = await api.getUserProfile()
            console.log('[AUTH] Profile response status:', profileResponse.status)
            
            if (profileResponse.status === 'success' && profileResponse.data) {
              const profile = profileResponse.data
              const updatedUser: User = {
                uid: profile.id,
                email: profile.email,
                displayName: profile.display_name,
                photoURL: undefined,
                role: profile.role || 'user',
                created_at: profile.created_at || undefined
              }
              setUser(updatedUser)
              // Update stored user data
              localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
              setLoading(false)
              console.log('[AUTH] Token validation successful')
              return
            }
          } catch (profileError) {
            console.error('[AUTH] Current token invalid, attempting refresh:', profileError)
            
            // If current token is invalid, try to refresh using refresh token
            if (refreshToken) {
              try {
                console.log('[AUTH] Attempting token refresh...')
                const refreshResponse = await api.refreshToken({ refresh_token: refreshToken })
                console.log('[AUTH] Refresh response status:', refreshResponse.status)
                
                if (refreshResponse.status === 'success' && refreshResponse.access_token) {
                  console.log('[AUTH] Token refresh successful')
                  // Update stored tokens
                  localStorage.setItem(TOKEN_KEY, refreshResponse.access_token)
                  localStorage.setItem('supabase_refresh_token', refreshResponse.refresh_token || refreshToken)
                  
                  // Update auth state with new token
                  setToken(refreshResponse.access_token)
                  setUser(parsedUser as User)
                  
                  // Try to fetch profile with new token
                  const newProfileResponse = await api.getUserProfile()
                  console.log('[AUTH] New profile response status:', newProfileResponse.status)
                  
                  if (newProfileResponse.status === 'success' && newProfileResponse.data) {
                    const profile = newProfileResponse.data
                    const updatedUser: User = {
                      uid: profile.id,
                      email: profile.email,
                      displayName: profile.display_name,
                      photoURL: undefined,
                      role: profile.role || 'user',
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
    signOut, 
    clearSession 
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export AuthContext for use in a .tsx provider wrapper
export { AuthContext }

// Utility function to handle 401 errors and logout
export const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    // Don't clear session data immediately, let the auth context handle it
    console.log('[AUTH] 401 error in handleAuthError - letting auth context handle')
    throw new Error('Authentication required. Please log in again.')
  }
}
