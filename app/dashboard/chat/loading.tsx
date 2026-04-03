import { AnimatedLoader } from "@/components/ui/animated-loader"

export default function ChatLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <AnimatedLoader size="xl" text="Loading conversations..." textClass="text-lg font-medium mt-6" />
    </div>
  )
}
