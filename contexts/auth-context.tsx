"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Define a simple user type
type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hardcoded credentials
const VALID_USERNAME = "buildaihackathon"
const VALID_PASSWORD = "buildaihackathon"

// Demo user object
const DEMO_USER: User = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Demo User",
  email: "demo@example.com",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      if (isLoggedIn) {
        setUser(DEMO_USER)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signIn = async (username: string, password: string) => {
    // Simple validation against hardcoded credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setUser(DEMO_USER)
      localStorage.setItem("isLoggedIn", "true")
      return { success: true }
    }

    return {
      success: false,
      error: "Invalid credentials. Please use username: buildaihackathon and password: buildaihackathon",
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
