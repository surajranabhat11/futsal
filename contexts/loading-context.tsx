"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  hasLoaded: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const sessionLoaded = sessionStorage.getItem("hasLoaded")
    if (sessionLoaded) {
      setIsLoading(false)
      setHasLoaded(true)
    }
  }, [])

  const finishLoading = () => {
    setIsLoading(false)
    setHasLoaded(true)
    sessionStorage.setItem("hasLoaded", "true")
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: finishLoading, hasLoaded }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}
