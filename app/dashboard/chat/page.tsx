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
import {
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Users,
  X,
  Loader2,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  MessageSquare,
} from "lucide-react"

import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { useChat } from "@/contexts/chat-context"
import { AnimatedLoader } from "@/components/ui/animated-loader"

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
  const [searchQuery, setSearchQuery] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatIdParam) selectChat(chatIdParam)
  }, [chatIdParam, selectChat])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await fetch("/api/users/connected")
        const data = await response.json()
        if (data.users) setAvailableUsers(data.users)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }
    if (isCreatingGroup) fetchUsers()
  }, [isCreatingGroup])

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
      console.error("Error sending message:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    try {
      const chatId = await createChat(selectedUsers, groupName, true);
      if (chatId) {
        setIsCreatingGroup(false);
        setGroupName("");
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "h:mm a");
  }

  const formatChatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return format(date, "h:mm a");
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return format(date, "EEEE");
    return format(date, "MMM d");
  }

  const renderFilePreview = (msg: any) => {
    if (!msg.fileUrl) return null
    if (msg.fileType?.startsWith("image/")) {
      return (
        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 overflow-hidden rounded-lg">
          <img
            src={msg.fileUrl || "/placeholder.svg"}
            alt={msg.fileName || "Image"}
            className="max-w-full max-h-[250px] object-cover hover:scale-105 transition-transform duration-500"
          />
        </a>
      )
    }
    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 mt-2 p-3 bg-background/50 rounded-xl border border-border/50 hover:bg-background transition-colors"
      >
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Paperclip className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{msg.fileName}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Attachment</p>
        </div>
      </a>
    )
  }

  const renderReadReceipts = (msg: Message) => {
    if (msg.sender._id !== currentUserId) return null
    const chat = chats.find((chat) => chat._id === selectedChat)
    const totalParticipants = chat?.participants.length || 0
    const readByOthersCount = msg.readBy.length - (msg.readBy.includes(currentUserId) ? 1 : 0)
    if (readByOthersCount === 0) return <Check className="h-3 w-3 text-muted-foreground" />
    if (readByOthersCount >= totalParticipants - 1) return <CheckCheck className="h-3 w-3 text-primary" />
    return <CheckCheck className="h-3 w-3 text-muted-foreground" />
  }

  const filteredChats = chats.filter(chat => 
    (chat.name || chat.otherParticipant?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeChat = chats.find(c => c._id === selectedChat)

  if (isLoadingChats && !selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AnimatedLoader size="xl" text="Connecting to locker room..." textClass="text-lg font-black font-heading mt-6 uppercase tracking-widest text-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight leading-none uppercase">Locker Room</h1>
          <p className="text-muted-foreground font-medium mt-1">Chat with your squad and rivals.</p>
        </div>
        <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-black uppercase tracking-wider px-6 shadow-lg shadow-primary/20">
              <Users className="h-4 w-4 mr-2" />
              New Squad
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black font-heading uppercase">Create Squad Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Squad Name</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter squad name..."
                  className="rounded-xl h-12 border-muted"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Players</label>
                {isLoadingUsers ? (
                  <div className="h-[250px] border rounded-2xl p-2 flex items-center justify-center bg-muted/20">
                    <AnimatedLoader size="md" />
                  </div>
                ) : (
                  <ScrollArea className="h-[250px] border rounded-2xl p-4 bg-muted/20">
                    {availableUsers.map((user) => (
                      <div key={user._id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-none">
                        <Avatar className="h-8 w-8 border border-border shadow-sm">
                           <AvatarFallback className="text-[10px] font-black">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <label htmlFor={`user-${user._id}`} className="flex-1 text-sm font-bold cursor-pointer">
                          {user.name}
                        </label>
                        <input
                          type="checkbox"
                          id={`user-${user._id}`}
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUsers([...selectedUsers, user._id])
                            else setSelectedUsers(selectedUsers.filter((id) => id !== user._id))
                          }}
                          className="h-5 w-5 rounded-md accent-primary border-muted"
                        />
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </div>
              <Button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                FORM SQUAD
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-3xl bg-background border border-border/50 shadow-2xl shadow-black/5">
        {/* CHAT LIST */}
        <div className={`w-full md:w-[350px] border-r border-border/50 flex flex-col bg-muted/10 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
           <div className="p-4 border-b border-border/50 space-y-4 bg-background/50">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search conversations..." 
                   className="pl-10 h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/30"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>
           <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-list-item flex items-center gap-3 p-3 cursor-pointer rounded-2xl transition-all ${
                      selectedChat === chat._id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted/50"
                    }`}
                    onClick={() => selectChat(chat._id)}
                  >
                    <div className="relative">
                       <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                         {chat.isGroupChat ? (
                           <>
                             <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                             <AvatarFallback className="bg-accent text-white"><Users className="h-5 w-5" /></AvatarFallback>
                           </>
                         ) : (
                           <>
                             <AvatarImage src="/placeholder.svg" />
                             <AvatarFallback className={selectedChat === chat._id ? "bg-white/20" : "bg-primary/10 text-primary"}>
                                {chat.otherParticipant?.name?.substring(0, 2).toUpperCase() || "U"}
                             </AvatarFallback>
                           </>
                         )}
                       </Avatar>
                       <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between gap-2">
                          <p className="font-bold truncate text-sm">
                             {chat.name || chat.otherParticipant?.name || 'Unknown'}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedChat === chat._id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                             {chat.lastMessageAt ? formatChatTime(chat.lastMessageAt) : "NEW"}
                          </p>
                       </div>
                       <p className={`text-xs truncate font-medium ${selectedChat === chat._id ? "text-primary-foreground/80" : "text-muted-foreground/80"}`}>
                          {chat.lastMessageSenderId === currentUserId ? "You: " : ""}
                          {typeof chat.lastMessage === 'string' ? chat.lastMessage : chat.lastMessage?.content || "No messages yet"}
                       </p>
                    </div>
                    {chat.unreadCount > 0 && selectedChat !== chat._id && (
                      <div className="h-5 w-5 rounded-full bg-accent text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
                {filteredChats.length === 0 && (
                  <div className="p-8 text-center opacity-30 grayscale py-20">
                     <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                     <p className="text-sm font-bold uppercase tracking-widest">No chats found</p>
                  </div>
                )}
              </div>
           </ScrollArea>
        </div>

        {/* MESSAGES AREA */}
        <div className={`flex-1 flex flex-col bg-background relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
           {selectedChat ? (
             <>
               <div className="h-20 border-b border-border/50 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                     <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => selectChat("")}>
                        <X className="h-5 w-5" />
                     </Button>
                     <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={activeChat?.isGroupChat ? activeChat.avatar : "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">
                           {(activeChat?.name || activeChat?.otherParticipant?.name || "U").substring(0, 2)}
                        </AvatarFallback>
                     </Avatar>
                     <div>
                        <h4 className="font-black font-heading text-base leading-none uppercase tracking-tight">
                           {activeChat?.name || activeChat?.otherParticipant?.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Online</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Phone className="h-5 w-5" /></Button>
                     <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Video className="h-5 w-5" /></Button>
                     <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Info className="h-5 w-5" /></Button>
                  </div>
               </div>

               <div className="flex-1 overflow-hidden relative">
                  <ScrollArea className="h-full">
                     <div className="p-6 space-y-6">
                        {messages.map((msg, idx) => {
                           const isCurrentUser = msg.sender._id === currentUserId;
                           const showAvatar = idx === 0 || messages[idx-1].sender._id !== msg.sender._id;
                           
                           return (
                              <div key={msg._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} items-end gap-3`}>
                                 {!isCurrentUser && (
                                    <div className={`w-8 shrink-0 ${!showAvatar && "invisible"}`}>
                                       <Avatar className="h-8 w-8 border border-border shadow-sm">
                                          <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                                             {msg.sender.name.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                       </Avatar>
                                    </div>
                                 )}
                                 <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[75%]`}>
                                    {showAvatar && !isCurrentUser && (
                                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1">
                                          {msg.sender.name}
                                       </span>
                                    )}
                                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                                       isCurrentUser 
                                       ? "bg-primary text-primary-foreground rounded-br-none shadow-primary/10" 
                                       : "bg-muted/50 rounded-bl-none"
                                    }`}>
                                       {msg.content}
                                       {renderFilePreview(msg)}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                       <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                          {formatMessageTime(msg.createdAt)}
                                       </span>
                                       {renderReadReceipts(msg)}
                                    </div>
                                 </div>
                              </div>
                           )
                        })}
                        <div ref={messagesEndRef} />
                     </div>
                  </ScrollArea>
               </div>

               <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-md">
                  {file && (
                    <div className="mb-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center">
                           <Paperclip className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                     <div className="flex-1 relative">
                        <Input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => { setMessage(e.target.value); if (startTyping) startTyping(); }}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                          className="h-12 rounded-2xl bg-muted/30 border-none pr-12 focus-visible:ring-primary/20 font-medium"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary"
                        >
                           <Smile className="h-5 w-5" />
                        </Button>
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-2xl bg-muted/30 text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                        onClick={() => fileInputRef.current?.click()}
                     >
                       <Paperclip className="h-5 w-5" />
                     </Button>
                     <Button
                       size="icon"
                       className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                       onClick={handleSendMessage}
                       disabled={isSendingMessage || (!message.trim() && !file)}
                     >
                       {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 fill-current" />}
                     </Button>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/5">
                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 border border-primary/10">
                   <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black font-heading uppercase tracking-tight">Select a conversation</h3>
                <p className="text-muted-foreground font-medium max-w-[300px] mt-2">
                   Choose a chat from the left to start coordinating your next match.
                </p>
                <Button variant="outline" className="mt-8 rounded-full px-8 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 text-primary" asChild>
                   <Link href="/dashboard/matchmaking">Find Players</Link>
                </Button>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
