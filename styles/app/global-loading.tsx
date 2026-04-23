"use client"

import { useState, useEffect } from "react"
import { AnimatedLoader } from "@/components/ui/animated-loader"
import { cn } from "@/lib/utils"

export function GlobalLoading() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate progress for visual feedback
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 200)

    // Stop loading after "progress" completes
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  if (!loading) return null

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
