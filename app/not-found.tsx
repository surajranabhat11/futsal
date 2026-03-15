import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <p className="text-8xl font-black text-green-100 dark:text-green-950">404</p>
          <div className="h-12 w-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto -mt-4">
            <span className="text-2xl">⚽</span>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400">The page you are looking for doesn't exist or has been moved.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
