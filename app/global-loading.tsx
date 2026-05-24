"use client"

import { useState, useEffect } from "react"
import { AnimatedLoader } from "@/components/ui/animated-loader"
import { cn } from "@/lib/utils"
import { useLoading } from "@/contexts/loading-context"

export function GlobalLoading() {
  const { isLoading, setIsLoading } = useLoading()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate progress for visual feedback
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10 // Increase by 10 instead of 5
      })
    }, 50) // Faster interval (50ms instead of 100ms)

    // Stop loading after "progress" completes
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // 800ms total instead of 2000ms

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [setIsLoading])

  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300",
        progress === 100 ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <AnimatedLoader size="xl" text={`Loading Futsal Opponent Matcher (${progress}%)`} />
      <div className="w-64 h-1 mt-8 bg-muted overflow-hidden rounded-full">
        <div className="h-full bg-primary transition-all duration-200 ease-in-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default GlobalLoading
