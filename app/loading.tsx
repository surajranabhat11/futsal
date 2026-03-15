import { AnimatedLoader } from "@/components/ui/animated-loader"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AnimatedLoader size="xl" text="Loading..." textClass="text-lg font-medium mt-6" />
    </div>
  )
}
