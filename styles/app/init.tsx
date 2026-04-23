"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { initializeDatabase } from "@/lib/db-init"
import { GlobalLoading } from "./global-loading"
import { useToast } from "@/hooks/use-toast"

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database (create indexes, etc.)
        await initializeDatabase()

        // Set initialized state
        setInitialized(true)
      } catch (error) {
        console.error("Error initializing app:", error)
        toast({
          title: "Error",
          description: "Failed to initialize application. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    initialize()
  }, [toast])

  if (!initialized) {
    return <GlobalLoading />
  }

  return <>{children}</>
}
