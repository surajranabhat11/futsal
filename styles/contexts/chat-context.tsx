"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface Chat {
  _id: string
  participants: string[]
  lastMessage: string
  lastMessageAt: string
  lastMessageSenderId?: string
  isGroupChat?: boolean
  name?: string
  avatar?: string
  otherParticipant?: {
    _id: string
    name: string
    email: string
  } | null
  participantDetails?: {
    _id: string
    name: string
    email: string
  }[]
  unreadCount: number
}

interface Message {
  _id: string
  chat: string
  sender: {
    _id: string
    name: string
  }
  content: string
  fileUrl?: string
  fileType?: string
  fileName?: string
  reactions?: Record<string, string[]>
  readBy: string[]
  createdAt: string
  updatedAt: string
}

interface ChatContextType {
  chats: Chat[]
  selectedChat: string | null
  messages: Message[]
  isLoadingChats: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
  typingUsers: Record<string, boolean>
  selectChat: (chatId: string) => void
  sendMessage: (content: string, file?: File) => Promise<void>
  markAsRead: (messageIds: string[]) => void
  addReaction: (messageId: string, reaction: string) => void
  createChat: (participantIds: string[], name?: string, isGroupChat?: boolean) => Promise<string | null>
  refreshChats: () => Promise<void>
  refreshMessages: () => Promise<void>
  startTyping: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!session?.user) return

    try {
      setIsLoadingChats(true)
      const response = await fetch("/api/chats")

      if (!response.ok) {
        throw new Error("Failed to fetch chats")
      }

      const data = await response.json()

      if (data.chats) {
        setChats(data.chats)

        if (data.chats.length > 0 && !selectedChat) {
          const firstValidChat = data.chats.find((chat: Chat | null) => chat?._id)
          if (firstValidChat) {
            setSelectedChat(firstValidChat._id)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast({
        title: "Error",
        description: "Failed to load your conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoadingChats(false)
    }
  }, [session, selectedChat, toast])

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async () => {
    if (!selectedChat || !session?.user) return

    try {
      setIsLoadingMessages(true)
      const response = await fetch(`/api/messages?chatId=${selectedChat}`)

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()

      if (data.messages) {
        const messagesWithSenderNames = data.messages.map((msg: Message) => ({
          ...msg,
          senderName: msg.sender.name || "Unknown User",
        }))
        setMessages(messagesWithSenderNames)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }, [selectedChat, session, toast])

  // FIX 2: Removed `chats` from the dependency array — it was recreating the
  // EventSource on every chat list update, causing it to miss incoming messages.
  useEffect(() => {
    if (!selectedChat || !session?.user) return

    const eventSource = new EventSource(`/api/messages/stream?chatId=${selectedChat}`)

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)

      setMessages((prevMessages) => {
        const exists = prevMessages.some((msg) => msg._id === newMessage._id)
        if (exists) return prevMessages
        return [
          ...prevMessages,
          {
            ...newMessage,
            senderName: newMessage.sender?.name || "Unknown User",
          },
        ]
      })

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === newMessage.chat
            ? {
                ...chat,
                lastMessage: newMessage.content || `Shared a ${newMessage.fileType || "file"}`,
                lastMessageAt: newMessage.createdAt,
                lastMessageSenderId: newMessage.sender?._id,
              }
            : chat
        )
      )
    }

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [selectedChat, session]) // ← `chats` removed from here

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchChats()
    }
  }, [session, fetchChats])

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [selectedChat, fetchMessages])

  // Send message
  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!selectedChat || !session?.user) return
      if (!content.trim() && !file) return

      setIsSendingMessage(true)

      const formData = new FormData()
      formData.append("chatId", selectedChat)
      formData.append("content", content)
      if (file) {
        formData.append("file", file)
      }

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const data = await response.json()

        // FIX 1: API returns { message: "...", messageData: {...} }
        // The original code read the whole response as the message object,
        // so newMessage._id was undefined and the optimistic update broke.
        const newMessage: Message = data.messageData

        if (!newMessage?._id) {
          throw new Error("Invalid message response from server")
        }

        const messageWithSenderName = {
          ...newMessage,
          senderName: newMessage.sender?.name || session.user.name || "Unknown User",
        }

        // Optimistically add message to state immediately
        setMessages((prevMessages) => {
          // Avoid duplicates in case SSE also delivers it
          const exists = prevMessages.some((msg) => msg._id === newMessage._id)
          if (exists) return prevMessages
          return [...prevMessages, messageWithSenderName]
        })

        // Update chat list with new last message
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === newMessage.chat
              ? {
                  ...chat,
                  lastMessage: newMessage.content || `Shared a ${newMessage.fileType || "file"}`,
                  lastMessageAt: newMessage.createdAt,
                  lastMessageSenderId: newMessage.sender?._id,
                }
              : chat
          )
        )
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      } finally {
        setIsSendingMessage(false)
      }
    },
    [selectedChat, session, toast]
  )

  // Mark messages as read
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!selectedChat || !session?.user || messageIds.length === 0) return

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageIds.includes(msg._id) && !msg.readBy.includes(session.user!.id!)
            ? { ...msg, readBy: [...msg.readBy, session.user!.id!] }
            : msg
        )
      )
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat
            ? { ...chat, unreadCount: Math.max(0, chat.unreadCount - messageIds.length) }
            : chat
        )
      )
    },
    [selectedChat, session]
  )

  // Add reaction
  const addReaction = useCallback(
    (messageId: string, reaction: string) => {
      if (!selectedChat || !session?.user) return

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === messageId) {
            const currentReactions = { ...(msg.reactions || {}) }
            const usersForReaction = currentReactions[reaction] || []
            const userId = session.user!.id!
            let updatedReactionsForEmoji: string[]

            if (usersForReaction.includes(userId)) {
              updatedReactionsForEmoji = usersForReaction.filter((id) => id !== userId)
            } else {
              updatedReactionsForEmoji = [...usersForReaction, userId]
            }

            if (updatedReactionsForEmoji.length === 0) {
              delete currentReactions[reaction]
            } else {
              currentReactions[reaction] = updatedReactionsForEmoji
            }

            return { ...msg, reactions: { ...currentReactions } }
          }
          return msg
        })
      )
    },
    [selectedChat, session]
  )

  // Create chat
  const createChat = useCallback(
    async (participantIds: string[], name?: string, isGroupChat?: boolean): Promise<string | null> => {
      if (!session?.user) return null

      try {
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantIds, name, isGroupChat }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to create chat" }))
          throw new Error(errorData.message || "Failed to create chat")
        }

        const data = await response.json()
        const newChat: Chat = data.chat ?? data

        setChats((prevChats) => [newChat, ...prevChats])
        setSelectedChat(newChat._id)
        toast({
          title: "Chat Created",
          description: name ? `Group chat "${name}" created.` : "New chat started.",
        })
        return newChat._id
      } catch (error: any) {
        console.error("Error creating chat:", error)
        toast({
          title: "Error",
          description: error.message || "Could not create the chat.",
          variant: "destructive",
        })
        return null
      }
    },
    [session, toast]
  )

  const refreshChats = useCallback(fetchChats, [fetchChats])
  const refreshMessages = useCallback(fetchMessages, [fetchMessages])

  const startTyping = useCallback(() => {
    if (!selectedChat || !session?.user?.id) return

    const userId = session.user.id
    setTypingUsers((prev) => ({ ...prev, [userId]: true }))
    setTimeout(() => {
      setTypingUsers((prev) => ({ ...prev, [userId]: false }))
    }, 3000)
  }, [selectedChat, session])

  const contextValue: ChatContextType = {
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isSendingMessage,
    typingUsers,
    selectChat: setSelectedChat,
    sendMessage,
    markAsRead,
    addReaction,
    createChat,
    refreshChats,
    refreshMessages,
    startTyping,
  }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}
