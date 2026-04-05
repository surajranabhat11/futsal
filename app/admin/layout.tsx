import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Trophy, Star, LogOut, Shield, MapPin, Swords, Bell } from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/matches", label: "Matches", icon: Trophy },
    { href: "/admin/challenges", label: "Challenges", icon: Swords },
    { href: "/admin/venues", label: "Venues", icon: MapPin },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* SIDEBAR */}
      <aside className="hidden w-60 flex-col border-r bg-white dark:bg-gray-900 md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            Admin <span className="text-green-600">Panel</span>
          </span>
        </div>
        <nav className="grid gap-1 p-3 pt-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-500 hover:text-gray-700">
              <LogOut className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Futsal Match — Admin</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
