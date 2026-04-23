"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  userId: string | null
  userName: string | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  userName: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session) {
      setIsAuthenticated(true)
      setUserId(session.user?.id || null)
      setUserName(session.user?.name || null)
    } else if (status === "unauthenticated") {
      setIsAuthenticated(false)
      setUserId(null)
      setUserName(null)
    }
  }, [session, status])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: status === "loading",
        userId,
        userName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
