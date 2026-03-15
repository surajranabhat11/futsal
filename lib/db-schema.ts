import type { ObjectId } from "mongodb"

// User schema
export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  createdAt: Date
  location?: string
  bio?: string
  position?: string
  skillLevel?: "Beginner" | "Intermediate" | "Advanced" | "Professional"
  availability?: string[]
  notifications?: {
    email: boolean
    app: boolean
    matches: boolean
    messages: boolean
  }
  profileImage?: string
}

// Match schema
export interface Match {
  _id?: ObjectId
  creatorId: string
  opponentId: string
  location: string
  date: string
  time: string
  teamSize: number
  status: "pending" | "accepted" | "rejected" | "completed"
  createdAt: Date
  score?: {
    creator: number
    opponent: number
  }
}

// Chat schema
export interface Chat {
  _id?: ObjectId
  participants: string[]
  createdAt: Date
  lastMessageAt: Date
  lastMessage: string
  lastMessageSenderId?: string
  createdBy: string
  isGroupChat: boolean
  name?: string
  avatar?: string
}

// Message schema
export interface Message {
  _id?: ObjectId
  chatId: string
  senderId: string
  senderName: string
  content: string
  fileUrl?: string
  fileType?: string
  fileName?: string
  reactions?: Record<string, string[]>
  readBy: string[]
  createdAt: Date
}

// Feedback schema
export interface Feedback {
  _id?: ObjectId
  matchId: string
  senderId: string
  recipientId: string
  rating: number
  comment?: string
  createdAt: Date
}

// Notification schema
export interface Notification {
  _id?: ObjectId
  recipientId: string
  senderId: string
  senderName: string
  type: "match_request" | "match_update" | "message" | "feedback"
  chatId?: string
  messageId?: string
  matchId?: string
  chatName?: string
  isGroupChat?: boolean
  content: string
  createdAt: Date
  read: boolean
  readAt?: Date
}

// Venue schema
export interface Venue {
  _id?: ObjectId
  name: string
  address: string
  location: {
    type: "Point"
    coordinates: [number, number] // [longitude, latitude]
  }
  rating: number
  price: string
  facilities: string[]
  availability: boolean
  availableSlots?: {
    date: string
    slots: {
      time: string
      isBooked: boolean
    }[]
  }[]
  createdAt: Date
}
