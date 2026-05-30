"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
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
  deleteChat: (chatId: string) => Promise<void>
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

  const userId = session?.user?.id

  const fetchChats = useCallback(async () => {
    if (!userId) return
    try {
      setIsLoadingChats(true)
      const response = await fetch("/api/chats")
      if (!response.ok) throw new Error("Failed to fetch chats")
      const data = await response.json()
      if (data.chats) {
        setChats(data.chats)
        setSelectedChat(prev => {
          if (prev) return prev
          const firstValidChat = data.chats.find((chat: Chat | null) => chat?._id)
          return firstValidChat?._id || null
        })
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast({ title: "Error", description: "Failed to load your conversations", variant: "destructive" })
    } finally {
      setIsLoadingChats(false)
    }
  }, [userId, toast])

  const fetchMessages = useCallback(async () => {
    if (!selectedChat || !userId) return
    try {
      setIsLoadingMessages(true)
      const response = await fetch(`/api/messages?chatId=${selectedChat}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      if (data.messages) {
        const messagesWithSenderNames = data.messages.map((msg: Message) => ({
          ...msg,
          sender: msg.sender || { _id: "", name: "Unknown" },
          senderName: msg.sender?.name || "Unknown User",
        }))
        setMessages(messagesWithSenderNames)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" })
    } finally {
      setIsLoadingMessages(false)
    }
  }, [selectedChat, userId, toast])

  useEffect(() => {
    if (!selectedChat || !userId) return
    const eventSource = new EventSource(`/api/messages/stream?chatId=${selectedChat}`)
    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)
      setMessages((prevMessages) => {
        const exists = prevMessages.some((msg) => msg._id === newMessage._id)
        if (exists) return prevMessages
        return [...prevMessages, { 
  ...newMessage, 
  sender: newMessage.sender || { _id: "", name: "Unknown" },
  senderName: newMessage.sender?.name || "Unknown User" 
}]
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
    return () => { eventSource.close() }
  }, [selectedChat, userId])

  useEffect(() => {
    if (userId) fetchChats()
  }, [userId, fetchChats])

  useEffect(() => {
    if (selectedChat) fetchMessages()
    else setMessages([])
  }, [selectedChat, fetchMessages])

  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!selectedChat || !userId) return
      if (!content.trim() && !file) return
      setIsSendingMessage(true)
      try {
        let fileUrl = null
        let fileName = null
        let fileType = null
        if (file) {
          const uploadFormData = new FormData()
          uploadFormData.append("file", file)
          const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFormData })
          if (!uploadRes.ok) {
            const err = await uploadRes.json()
            throw new Error(err.error || "File upload failed")
          }
          const uploadData = await uploadRes.json()
          fileUrl = uploadData.url
          fileName = file.name
          fileType = file.type
        }
        const formData = new FormData()
        formData.append("chatId", selectedChat)
        formData.append("content", content || "")
        if (fileUrl) formData.append("fileUrl", fileUrl)
        if (fileName) formData.append("fileName", fileName)
        if (fileType) formData.append("fileType", fileType)
        const response = await fetch("/api/messages", { method: "POST", body: formData })
        if (!response.ok) throw new Error("Failed to send message")
        const data = await response.json()
        const newMessage: Message = data.messageData
        if (!newMessage?._id) throw new Error("Invalid message response from server")
        const messageWithSenderName = {
          ...newMessage,
          senderName: newMessage.sender?.name || session?.user?.name || "Unknown User",
        }
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg._id === newMessage._id)
          if (exists) return prevMessages
          return [...prevMessages, messageWithSenderName]
        })
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === newMessage.chat
              ? {
                  ...chat,
                  lastMessage: newMessage.content || `Shared a file`,
                  lastMessageAt: newMessage.createdAt,
                  lastMessageSenderId: newMessage.sender?._id,
                }
              : chat
          )
        )
      } catch (error: any) {
        console.error("Error sending message:", error)
        toast({ title: "Error", description: error.message || "Failed to send message", variant: "destructive" })
      } finally {
        setIsSendingMessage(false)
      }
    },
    [selectedChat, userId, session?.user?.name, toast]
  )

  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!selectedChat || !userId || messageIds.length === 0) return
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageIds.includes(msg._id) && !msg.readBy.includes(userId)
            ? { ...msg, readBy: [...msg.readBy, userId] }
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
    [selectedChat, userId]
  )

  const addReaction = useCallback(
    (messageId: string, reaction: string) => {
      if (!selectedChat || !userId) return
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === messageId) {
            const currentReactions = { ...(msg.reactions || {}) }
            const usersForReaction = currentReactions[reaction] || []
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
    [selectedChat, userId]
  )

  const createChat = useCallback(
    async (participantIds: string[], name?: string, isGroupChat?: boolean): Promise<string | null> => {
      if (!userId) return null
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
        toast({ title: "Chat Created", description: name ? `Group chat "${name}" created.` : "New chat started." })
        return newChat._id
      } catch (error: any) {
        console.error("Error creating chat:", error)
        toast({ title: "Error", description: error.message || "Could not create the chat.", variant: "destructive" })
        return null
      }
    },
    [userId, toast]
  )

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete chat")
      }
      setChats(prev => prev.filter(c => c._id !== chatId))
      if (selectedChat === chatId) setSelectedChat(null)
      setMessages([])
      toast({ title: "Chat deleted successfully" })
    } catch (error: any) {
      console.error("Error deleting chat:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }, [selectedChat, toast])

  const refreshChats = useCallback(() => fetchChats(), [fetchChats])
  const refreshMessages = useCallback(() => fetchMessages(), [fetchMessages])

  const startTyping = useCallback(() => {
    if (!selectedChat || !userId) return
    setTypingUsers((prev) => ({ ...prev, [userId]: true }))
    setTimeout(() => {
      setTypingUsers((prev) => ({ ...prev, [userId]: false }))
    }, 3000)
  }, [selectedChat, userId])

  const contextValue = useMemo(() => ({
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
    deleteChat,
    refreshChats,
    refreshMessages,
    startTyping,
  }), [
    chats, selectedChat, messages, isLoadingChats, isLoadingMessages,
    isSendingMessage, typingUsers, sendMessage, markAsRead, addReaction,
    createChat, deleteChat, refreshChats, refreshMessages, startTyping,
  ])

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}