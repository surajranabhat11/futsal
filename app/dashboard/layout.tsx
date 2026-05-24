import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, MapPin, MessageSquare, Star, User, LogOut, Menu, Shield, Store, Calendar, UserCheck } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Notifications } from "@/components/notifications"
import { ErrorBoundary } from "@/components/error-boundary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase())
  const isAdmin = adminEmails.includes((session?.user?.email || "").toLowerCase()) || session?.user?.role === "admin"
  const isOwner = session?.user?.role === "owner"

  const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/location", label: "Find Venues", icon: MapPin },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/matchmaking", label: "Matchmaking", icon: Users },
  { href: "/dashboard/friends", label: "Friends", icon: UserCheck }, // ✅ add this
  { href: "/dashboard/chat", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/feedback", label: "Feedback", icon: Star },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
]

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sidebar-primary-foreground text-sm font-black">F</span>
          </div>
          <span className="font-heading text-lg font-bold text-sidebar-foreground">
            Player<span className="text-accent">Hub</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3 pt-4 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          
          {(isAdmin || isOwner) && (
             <div className="mt-4 pt-4 border-t border-sidebar-border space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-2">Management</p>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-primary hover:bg-sidebar-accent transition-colors">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {isOwner && (
                  <Link href="/owner-dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-primary hover:bg-sidebar-accent transition-colors">
                    <Store className="h-4 w-4" />
                    Owner Dashboard
                  </Link>
                )}
             </div>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link href="/api/auth/signout">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <div className="flex flex-1 flex-col">
        {/* HEADER */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
                  <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                      <span className="text-sidebar-primary-foreground text-sm font-black">F</span>
                    </div>
                    <span className="font-heading text-lg font-bold text-sidebar-foreground">
                      Player<span className="text-accent">Hub</span>
                    </span>
                  </div>
                  <nav className="flex flex-col gap-1 p-4">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1">
             <h1 className="font-heading text-lg font-bold tracking-tight text-foreground md:block hidden">
                Dashboard Overview
             </h1>
          </div>

          <div className="flex items-center gap-3">
            <Notifications />
            <div className="h-8 w-px bg-border mx-1" />
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-primary/10">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                   {session?.user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">{session?.user?.name || "Player"}</span>
              </Button>
            </Link>
            <div className="h-8 w-px bg-border mx-1" />
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive group" title="Sign Out">
                <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
