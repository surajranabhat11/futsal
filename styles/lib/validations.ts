import { z } from "zod"

// User validation schemas
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  position: z.string().optional(),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Professional"]).optional(),
  availability: z.array(z.string()).optional(),
  notifications: z
    .object({
      email: z.boolean(),
      app: z.boolean(),
      matches: z.boolean(),
      messages: z.boolean(),
    })
    .optional(),
})

// Match validation schemas
export const createMatchSchema = z.object({
  opponentId: z.string().min(1, "Opponent is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  teamSize: z.number().int().min(1, "Team size is required"),
})

export const updateMatchSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "completed"]),
  score: z
    .object({
      creator: z.number().int().min(0),
      opponent: z.number().int().min(0),
    })
    .optional(),
})

// Chat validation schemas
export const createChatSchema = z.object({
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
  name: z.string().optional(),
  isGroupChat: z.boolean().optional(),
})

export const updateChatSchema = z.object({
  name: z.string().optional(),
  addParticipants: z.array(z.string()).optional(),
  removeParticipants: z.array(z.string()).optional(),
})

// Message validation schemas
export const createMessageSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  content: z.string().optional(),
  // File validation is handled separately
})

// Feedback validation schemas
export const createFeedbackSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  recipientId: z.string().min(1, "Recipient ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
})

// Venue validation schemas
export const createVenueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  rating: z.number().min(0).max(5),
  price: z.string(),
  facilities: z.array(z.string()),
  availability: z.boolean(),
})
