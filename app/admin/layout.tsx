import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Trophy, LogOut, Shield, MapPin, Swords, Bell } from "lucide-react"

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
    <div className="flex min-h-screen bg-muted/30">
      {/* SIDEBAR */}
      <aside className="hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-sidebar-foreground">
            Admin <span className="text-accent">Panel</span>
          </span>
        </div>
        <nav className="grid gap-1 p-3 pt-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <LogOut className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border bg-background/90 backdrop-blur-md px-6">
          <h1 className="font-heading text-lg font-semibold text-foreground">Futsal Match — <span className="text-accent">Admin</span></h1>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
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
