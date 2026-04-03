import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function FeedbackLoading() {
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
        <SkeletonCard lines={4} />
        <div className="mt-6">
          <SkeletonCard lines={6} footer />
        </div>
      </div>
    </div>
  )
}
