import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, MapPin, MessageSquare, Star, User, LogOut, Menu, Shield, Store, Calendar } from "lucide-react"
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
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/location", label: "Location", icon: MapPin },
    { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
    { href: "/dashboard/matchmaking", label: "Matchmaking", icon: Users },
    { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
    { href: "/dashboard/feedback", label: "Feedback", icon: Star },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-4">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-black tracking-tight">F</span>
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-foreground hidden md:inline">
              Futsal<span className="text-accent">Match</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                  title="Admin Panel"
                >
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Notifications />
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
                <div className="p-4 border-b border-sidebar-border">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-sidebar-primary rounded-lg flex items-center justify-center">
                      <span className="text-sidebar-primary-foreground text-sm font-black">F</span>
                    </div>
                    <span className="font-heading text-base font-bold text-sidebar-foreground">
                      Futsal<span className="text-accent">Match</span>
                    </span>
                  </div>
                </div>
                <nav className="grid gap-1 p-3">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link href="/admin"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-primary hover:bg-sidebar-accent transition-colors mt-2 border-t border-sidebar-border pt-4">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  {isOwner && (
                    <Link href="/owner-dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-primary hover:bg-sidebar-accent transition-colors mt-2 border-t border-sidebar-border pt-4">
                      <Store className="h-4 w-4" />
                      Owner Dashboard
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="hidden w-60 border-r border-sidebar-border bg-sidebar md:block">
          <nav className="grid gap-1 p-3 pt-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-primary hover:bg-sidebar-accent transition-colors mt-2 border-t border-sidebar-border pt-4">
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
            {isOwner && (
              <Link href="/owner-dashboard"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-primary hover:bg-sidebar-accent transition-colors mt-2 border-t border-sidebar-border pt-4">
                <Store className="h-4 w-4" />
                Owner Dashboard
              </Link>
            )}
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
