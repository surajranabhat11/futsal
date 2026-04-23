import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface SkeletonCardProps {
  header?: boolean
  footer?: boolean
  lines?: number
}

export function SkeletonCard({ header = true, footer = false, lines = 3 }: SkeletonCardProps) {
  return (
    <Card>
      {header && (
        <CardHeader className="gap-2">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-2">
        {Array(lines)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className={`h-4 w-${Math.floor(Math.random() * 40) + 60}%`} />
          ))}
      </CardContent>
      {footer && (
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      )}
    </Card>
  )
}
