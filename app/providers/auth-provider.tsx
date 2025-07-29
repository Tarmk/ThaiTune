"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
        // Set initialLoad to false after first auth check
        if (initialLoad) {
          setInitialLoad(false)
        }
      }
    }, (error) => {
      // Handle auth errors silently to prevent flashing
      if (mounted) {
        console.warn('Auth state change error:', error)
        setLoading(false)
        if (initialLoad) {
          setInitialLoad(false)
        }
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [initialLoad])

  // Show minimal loading only on very first load and only for a short time
  if (initialLoad && loading) {
    // Set a timeout to show content even if auth is still loading
    setTimeout(() => {
      if (initialLoad) {
        setInitialLoad(false)
      }
    }, 800) // Max 800ms loading screen

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1f2c]">
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4A1D2C] dark:border-[#8A3D4C] border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
} 