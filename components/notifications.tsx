"use client"

import { useState, useEffect } from "react"
import { Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotification } from "@/contexts/notification-context"

export function Notifications() {
  const { notifications, unreadCount, isLoading, isOpen, setIsOpen, markAsRead, markAllAsRead, refreshNotifications } =
    useNotification()
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  // Refresh notifications when popover opens
  useEffect(() => {
    if (isOpen) {
      refreshNotifications()
    }
  }, [isOpen, refreshNotifications])

  const handleMarkAllAsRead = async () => {
    setIsMarkingRead(true)
    await markAllAsRead()
    setIsMarkingRead(false)
  }

  const handleNotificationClick = async (notificationId: string, url?: string) => {
    // Mark as read
    await markAsRead(notificationId)

    // Navigate if URL is provided
    if (url) {
      window.location.href = url
    }

    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={isMarkingRead}>
              {isMarkingRead ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Marking...</span>
                </div>
              ) : (
                "Mark all as read"
              )}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => {
                // Determine URL based on notification type
                let url: string | undefined
                if (notification.type === "message" && notification.chatId) {
                  url = `/dashboard/chat?chatId=${notification.chatId}`
                } else if (notification.type === "match_invite" && notification.matchId) {
                  url = `/dashboard/matchmaking?matchId=${notification.matchId}`
                } else if (notification.type === "match_update" && notification.matchId) {
                  url = `/dashboard/matchmaking?matchId=${notification.matchId}`
                } else if (notification.type === "player_invite") {
                  url = `/dashboard#invitations`
                } else if (notification.type === "feedback") {
                  url = `/dashboard/feedback`
                }

                return (
                  <div
                    key={notification._id}
                    className={`p-4 border-b cursor-pointer hover:bg-accent ${!notification.read ? "bg-accent/50" : ""}`}
                    onClick={() => handleNotificationClick(notification._id, url)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{notification.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm mt-1 line-clamp-2">
                      {notification.isGroupChat && notification.chatName && (
                        <span className="font-medium">{notification.chatName}: </span>
                      )}
                      {notification.type === "match_invite" ? (
                        <span className="font-medium">Match Invitation: </span>
                      ) : notification.type === "player_invite" ? (
                        <span className="font-medium">Player Invitation: </span>
                      ) : null}
                      {notification.content}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}