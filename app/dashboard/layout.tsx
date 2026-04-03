import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, MapPin, MessageSquare, Star, User, LogOut, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Notifications } from "@/components/notifications"
import { ErrorBoundary } from "@/components/error-boundary"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/matchmaking", label: "Matchmaking", icon: Users },
    { href: "/dashboard/location", label: "Location", icon: MapPin },
    { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
    { href: "/dashboard/feedback", label: "Feedback", icon: Star },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-center px-4">
          {/* <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <span className="text-gray-900 dark:text-white">Futsal <span className="text-green-600">Match</span></span>
          </Link> */}
          <div className="flex items-center gap-2">
            <Notifications />
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-50 dark:hover:bg-green-900/20">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="icon" className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-black">F</span>
                    </div>
                    <span>Futsal <span className="text-green-600">Match</span></span>
                  </div>
                </div>
                <nav className="grid gap-1 p-3">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="hidden w-60 border-r bg-white dark:bg-gray-900 md:block">
          <nav className="grid gap-1 p-3 pt-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
