"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, Smile, Check, CheckCheck, Users, X, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { useChat } from "@/contexts/chat-context"
import { AnimatedLoader } from "@/components/ui/animated-loader"
import EmojiPicker from "@/components/emoji-picker"

interface Message {
  _id: string;
  chat: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  readBy: string[];
  reactions?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

interface Chat {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId?: string;
  isGroupChat?: boolean;
  name?: string;
  avatar?: string;
  otherParticipant?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  participantDetails?: {
    _id: string;
    name: string;
    email: string;
  }[];
  unreadCount: number;
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const chatIdParam = searchParams.get("chatId")
  const { data: session } = useSession()
  const currentUserId = session?.user?.id ?? ""

  const {
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isSendingMessage,
    typingUsers,
    selectChat,
    sendMessage,
    markAsRead,
    addReaction,
    startTyping,
    createChat,
  } = useChat()

  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Set selected chat from URL parameter
  useEffect(() => {
    if (chatIdParam) {
      selectChat(chatIdParam)
    }
  }, [chatIdParam, selectChat])

  // Fetch available users for group chat creation
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await fetch("/api/users/connected")
        const data = await response.json()

        if (data.users) {
          setAvailableUsers(data.users)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (isCreatingGroup) {
      fetchUsers()
    }
  }, [isCreatingGroup])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if ((!message.trim() && !file) || !selectedChat) return;

    try {
      await sendMessage(message, file || undefined);
      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      const chatId = await createChat(selectedUsers, groupName, true); // Pass groupName to createChat

      if (chatId) {
        setIsCreatingGroup(false);
        setGroupName("");
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return "Invalid Date"; // Handle null or undefined values
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date formats
    return format(date, "h:mm a");
  }

  const formatChatTime = (dateString: string) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const now = new Date();

    // If the message is from today, show the time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    }

    // If the message is from this week, show the day
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(date, "EEEE");
    }

    // Otherwise, show the date
    return format(date, "MMM d");
  };

  const renderFilePreview = (msg: any) => {
    if (!msg.fileUrl) return null

    if (msg.fileType?.startsWith("image/")) {
      return (
        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <img
            src={msg.fileUrl || "/placeholder.svg"}
            alt={msg.fileName || "Image"}
            className="max-w-[200px] max-h-[200px] rounded-md object-cover"
          />
        </a>
      )
    }

    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-2 p-2 bg-background rounded-md border"
      >
        <Paperclip className="h-4 w-4" />
        <span className="text-sm truncate">{msg.fileName}</span>
      </a>
    )
  }

  const renderReadReceipts = (msg: Message) => {
    if (msg.sender._id !== currentUserId) return null

    const chat = chats.find((chat) => chat._id === selectedChat)
    const totalParticipants = chat?.participants.length || 0
    const readByCount = msg.readBy.length

    // Don't show read receipts for sender's own messages
    const readByOthersCount = readByCount - (msg.readBy.includes(currentUserId) ? 1 : 0)

    if (readByOthersCount === 0) {
      return <Check className="h-3 w-3 text-muted-foreground" />
    }

    // If all participants have read the message
    if (readByOthersCount >= totalParticipants - 1) {
      return <CheckCheck className="h-3 w-3 text-primary" />
    }

    return <CheckCheck className="h-3 w-3 text-muted-foreground" />
  }

  const renderReactions = (msg: Message) => {
    if (!msg.reactions || Object.keys(msg.reactions).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(msg.reactions).map(([reaction, users]) => (
          <TooltipProvider key={`${msg._id}-${reaction}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    users.includes(currentUserId || "") ? "bg-primary/20" : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => addReaction(msg._id, reaction)}
                >
                  {reaction}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {users.length} {users.length === 1 ? "person" : "people"} reacted
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  // Render loading state for the entire chat page
  if (isLoadingChats && !selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <AnimatedLoader size="xl" text="Loading conversations..." textClass="text-lg font-medium mt-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">Communicate with other players and teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Conversations</CardTitle>
            <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Group Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="group-name" className="text-sm font-medium">
                      Group Name
                    </label>
                    <Input
                      id="group-name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Participants</label>
                    {isLoadingUsers ? (
                      <div className="h-[200px] border rounded-md p-2 flex items-center justify-center">
                        <AnimatedLoader size="md" text="Loading users..." />
                      </div>
                    ) : (
                      <ScrollArea className="h-[200px] border rounded-md p-2">
                        {availableUsers.map((user) => (
                          <div key={user._id} className="flex items-center space-x-2 py-2">
                            <input
                              type="checkbox"
                              id={`user-${user._id}`}
                              checked={selectedUsers.includes(user._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user._id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter((id) => id !== user._id))
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <label htmlFor={`user-${user._id}`} className="text-sm">
                              {user.name}
                            </label>
                          </div>
                        ))}
                      </ScrollArea>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0}>
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(80vh-10rem)]">
              {isLoadingChats ? (
                <div className="space-y-4 p-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-accent ${
                      selectedChat === chat._id ? "bg-accent" : ""
                    }`}
                    onClick={() => selectChat(chat._id)}
                  >
                    <Avatar>
                      {chat.isGroupChat ? (
                        <>
                          <AvatarImage
                            src={chat.avatar || "/placeholder.svg?height=40&width=40"}
                            alt={chat.name || "Group Chat"}
                          />
                          <AvatarFallback>
                            <Users className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt={chat.otherParticipant?.name || "User"}
                          />
                          <AvatarFallback>{chat.otherParticipant?.name?.substring(0, 2) || "U"}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {chat.name || 'Unknown chat'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chat.lastMessageAt ? formatChatTime(chat.lastMessageAt) : "New"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {(() => {
                          if (!chat.lastMessage) return "No messages yet";
                          if (typeof chat.lastMessage === 'string') return chat.lastMessage;
                          if (typeof chat.lastMessage === 'object' && 'content' in chat.lastMessage) {
                            return chat.lastMessage.content;
                          }
                          return "No messages yet";
                        })()}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge variant="default" className="rounded-full px-2">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      {chats.find((chat) => chat._id === selectedChat)?.isGroupChat ? (
                        <>
                          <AvatarImage
                            src={
                              chats.find((chat) => chat._id === selectedChat)?.avatar ||
                              "/placeholder.svg?height=40&width=40" ||
                              "/placeholder.svg"
                            }
                            alt={chats.find((chat) => chat._id === selectedChat)?.name || "Group Chat"}
                          />
                          <AvatarFallback>
                            <Users className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt={chats.find((chat) => chat._id === selectedChat)?.otherParticipant?.name || "User"}
                          />
                          <AvatarFallback>
                            {chats.find((chat) => chat._id === selectedChat)?.otherParticipant?.name?.substring(0, 2) ||
                              "U"}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle>
                        {selectedChat
                          ? chats.find((chat) => chat._id === selectedChat)?.name || // Display the chat name
                            chats.find((chat) => chat._id === selectedChat)?.otherParticipant?.name || "Chat"
                          : "Chat"}
                      </CardTitle>
                      {typingUsers && Object.values(typingUsers).some((isTyping) => isTyping) && (
                        <p className="text-xs text-muted-foreground">Typing...</p>
                      )}
                    </div>
                  </div>
                  {chats.find((chat) => chat._id === selectedChat)?.isGroupChat && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Users className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Group Members</h4>
                          <div className="space-y-2">
                            {chats
                              .find((chat) => chat._id === selectedChat)
                              ?.participantDetails?.map((participant) => (
                                <div key={participant._id} className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={participant.name} />
                                    <AvatarFallback>{participant.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{participant.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col">
                <ScrollArea className="flex-1 h-[calc(80vh-16rem)]">
                  {isLoadingMessages ? (
                    <div className="p-4 space-y-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={`loading-${i}`} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                          <div className="h-16 w-48 rounded-lg bg-muted animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="p-4 space-y-4">
                      {messages.map((msg) => {
                        const isCurrentUser = msg.sender._id === currentUserId;
                        const senderName = msg.sender.name || "Unknown User";

                        return (
                          <div
                            key={`message-${msg._id}`}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex flex-col max-w-[80%]">
                              {!isCurrentUser && (
                                <div key={`sender-${msg._id}`} className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src="/placeholder.svg?height=24&width=24"
                                      alt={senderName}
                                    />
                                    <AvatarFallback>
                                      {senderName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium">{senderName}</span>
                                </div>
                              )}
                              <div
                                key={`content-${msg._id}`}
                                className={`rounded-lg p-3 ${
                                  isCurrentUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                {renderFilePreview(msg)}
                                {renderReactions(msg)}
                              </div>
                              <div key={`footer-${msg._id}`} className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                                {renderReadReceipts(msg)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t">
                  {file && (
                    <div className="mb-2 p-2 border rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Paperclip className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (startTyping) startTyping();
                      }}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || (!message.trim() && !file)}
                    >
                      {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-[calc(80vh-10rem)]">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {chats.length > 0
                    ? "Select a conversation to start chatting"
                    : "No conversations yet. Start a match to chat with other players!"}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
