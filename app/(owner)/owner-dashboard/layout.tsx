"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Home, CalendarDays, MapPin, LayoutDashboard, Store, AlertCircle } from "lucide-react"

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "owner")) {
      router.push("/dashboard") 
    }
  }, [status, session, router])

  if (status === "loading" || session?.user?.role !== "owner") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  const navItems = [
    { href: "/owner-dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/owner-dashboard/venues", label: "My Venues", icon: Store },
    { href: "/owner-dashboard/bookings", label: "Manage Bookings", icon: CalendarDays },
  ]

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-sidebar-border bg-sidebar md:block">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-black tracking-tight text-white">F</span>
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-foreground">
              Owner<span className="text-primary">Portal</span>
            </span>
          </div>
        </div>
        
        <nav className="grid gap-1 p-3 pt-4">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all group"
            >
              <item.icon className="h-4 w-4 transition-colors group-hover:text-primary" />
              {item.label}
            </Link>
          ))}
          <div className="mt-8 px-3">
             <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-2">
                <Home className="h-3 w-3" /> Back to Player View
             </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
