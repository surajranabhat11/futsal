import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LocationLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <SkeletonCard lines={1} footer={false} />

      <div className="space-y-4">
        <Skeleton className="h-6 w-[200px]" />
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[150px] w-full rounded-lg" />
          ))}
      </div>

      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}
