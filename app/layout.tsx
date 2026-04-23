import type React from "react"
import type { Metadata } from "next"
import { Syne, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/contexts/app-provider.tsx"
import { GlobalLoading } from "./global-loading.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/toaster.tsx"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const syne = Syne({ subsets: ["latin"], variable: "--font-heading" })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" })

export const metadata: Metadata = {
  title: "Futsal Match Making System",
  description: "Connect with futsal players and teams in your area",
  generator: ""
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${syne.variable} ${plusJakarta.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <GlobalLoading />

            {/* HEADER */}
            <header className="site-header sticky top-0 z-50">
              <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-black tracking-tight">F</span>
                  </div>
                  <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                    Futsal<span className="text-accent">Match</span>
                  </span>
                </Link>
                <nav className="hidden md:flex gap-7">
                  <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
                  <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
                  <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                </nav>
                <div className="flex gap-2.5">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </header>

            {/* PAGE CONTENT */}
            {children}

            {/* FOOTER */}
            <footer className="site-footer py-10 md:py-12">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2 footer-brand">
                    <div className="h-7 w-7 bg-sidebar-primary rounded-md flex items-center justify-center">
                      <span className="text-sidebar-primary-foreground text-xs font-black">F</span>
                    </div>
                    <span className="font-heading font-bold">Futsal Match</span>
                  </div>
                  <div className="flex gap-6">
                    <Link href="/about" className="text-xs transition-colors">About</Link>
                    <Link href="/terms" className="text-xs transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="text-xs transition-colors">Privacy Policy</Link>
                    <Link href="/contact" className="text-xs transition-colors">Contact Us</Link>
                  </div>
                  <p className="text-xs">
                    © {new Date().getFullYear()} Futsal Opponent Matcher. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>

          </AppProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
