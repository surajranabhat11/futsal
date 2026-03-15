import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
