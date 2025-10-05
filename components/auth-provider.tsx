"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiClient, User } from "../lib/api-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true to check for existing session

  // Check for existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Try to get current user with existing token
          const currentUser = await apiClient.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        // Token is invalid or expired, clear it
        console.warn('Session restoration failed:', error)
        localStorage.removeItem('auth_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await apiClient.login(email, password)
      setUser(response.user)
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call API logout to invalidate token on server
      await apiClient.logout()
    } catch (error) {
      // Even if API logout fails, we still want to clear local state
      console.warn('API logout failed:', error)
    } finally {
      // Clear user state
      setUser(null)
      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}