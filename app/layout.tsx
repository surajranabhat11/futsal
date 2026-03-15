import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/contexts/app-provider.tsx"
import { GlobalLoading } from "./global-loading.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/toaster.tsx"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Futsal Match Making System",
  description: "Connect with futsal players and teams in your area",
    generator: ''
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
            {children}
          </AppProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
