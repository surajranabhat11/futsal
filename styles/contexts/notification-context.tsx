"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  _id: string
  recipientId: string
  senderId: string
  senderName: string
  type: "match_invite" | "match_update" | "message" | "feedback" | "player_invite"
  chatId?: string
  messageId?: string
  matchId?: string
  chatName?: string
  isGroupChat?: boolean
  content: string
  createdAt: string
  read: boolean
  readAt?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  markAsRead: (notificationId?: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications?limit=20")

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()

      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session, fetchNotifications])

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId?: string) => {
      if (!session?.user) return

      try {
        const body = notificationId ? { notificationIds: [notificationId] } : { all: true }

        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          throw new Error("Failed to mark notification as read")
        }

        // Update local state
        if (notificationId) {
          setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
        } else {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    },
    [session],
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    await markAsRead()
  }, [markAsRead])

  const value = {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
