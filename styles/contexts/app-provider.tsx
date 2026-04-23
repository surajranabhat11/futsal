"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/toaster.tsx"
import { ChatProvider } from "./chat-context.tsx"
import { MatchmakingProvider } from "./matchmaking-context.tsx"
import { ProfileProvider } from "./profile-context.tsx"
import { VenueProvider } from "./venue-context.tsx"
import { NotificationProvider } from "./notification-context.tsx"

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <NotificationProvider>
          <ProfileProvider>
            <MatchmakingProvider>
              <VenueProvider>
                <ChatProvider>
                  {children}
                  <Toaster />
                </ChatProvider>
              </VenueProvider>
            </MatchmakingProvider>
          </ProfileProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
