import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/contexts/app-provider.tsx"
import { GlobalLoading } from "./global-loading.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/toaster.tsx"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <GlobalLoading />

            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
              <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-black">F</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">Futsal <span className="text-green-600">Match</span></span>
                </Link>
                <nav className="hidden md:flex gap-8">
                  <Link href="/about" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">About</Link>
                  <Link href="/how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">How It Works</Link>
                  <Link href="/contact" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Contact</Link>
                </nav>
                <div className="flex gap-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </header>

            {/* PAGE CONTENT */}
            {children}

            {/* FOOTER */}
            <footer className="border-t bg-gray-50 dark:bg-gray-950 py-10 md:py-12">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-green-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-black">F</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">Futsal Match</span>
                  </div>
                  <div className="flex gap-6">
                    <Link href="/about" className="text-xs text-gray-500 hover:text-green-600 transition-colors">About</Link>
                    <Link href="/terms" className="text-xs text-gray-500 hover:text-green-600 transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="text-xs text-gray-500 hover:text-green-600 transition-colors">Privacy Policy</Link>
                    <Link href="/contact" className="text-xs text-gray-500 hover:text-green-600 transition-colors">Contact Us</Link>
                  </div>
                  <p className="text-xs text-gray-400">
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
