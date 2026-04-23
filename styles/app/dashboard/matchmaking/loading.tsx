import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MatchmakingLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="w-full">
        <div className="flex w-full mb-6">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <SkeletonCard lines={6} footer />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
            ))}
        </div>
      </div>
    </div>
  )
}
