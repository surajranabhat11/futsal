import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedLoader } from "./animated-loader"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  animated?: boolean
}

export function LoadingSpinner({ size = "md", className, text, animated = false }: LoadingSpinnerProps) {
  if (animated) {
    return <AnimatedLoader size={size} text={text} className={className} />
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
