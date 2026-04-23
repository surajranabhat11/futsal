"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  textClass?: string
}

export function AnimatedLoader({ className, size = "md", text, textClass }: AnimatedLoaderProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show animation after component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  if (!mounted) {
    return null
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div
          className={cn(
            "absolute inset-0 rounded-full border-t-2 border-b-2 animate-spin",
            theme === "dark" ? "border-primary" : "border-primary/80",
          )}
        />
        <div
          className={cn(
            "absolute inset-1 rounded-full border-r-2 border-l-2 animate-ping opacity-75",
            theme === "dark" ? "border-primary/40" : "border-primary/30",
          )}
        />
        <div
          className={cn(
            "absolute inset-2 rounded-full border-2 animate-pulse",
            theme === "dark" ? "border-primary/20" : "border-primary/10",
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn("w-1/4 h-1/4 rounded-full animate-pulse", theme === "dark" ? "bg-primary" : "bg-primary")}
          />
        </div>
      </div>
      {text && <p className={cn("mt-4 text-center animate-pulse", textClass || "text-muted-foreground")}>{text}</p>}
    </div>
  )
}
