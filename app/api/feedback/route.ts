import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// ── Inline Feedback model (avoids needing a separate model file) ──
const FeedbackSchema = new mongoose.Schema(
  {
    sender:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:      { type: Number, min: 1, max: 5, required: true },
    comment:     { type: String, default: "" },
  },
  { timestamps: true }
)
FeedbackSchema.index({ sender: 1, recipient: 1 }, { unique: true }) // one review per pair

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema)

export { Feedback }

// ── GET /api/feedback?recipientId=xxx  → public, returns all feedback for a player ──
export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get("recipientId")

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json({ error: "Valid recipientId is required" }, { status: 400 })
    }

    const feedbackList = await Feedback.find({ recipient: recipientId })
      .populate("sender", "name image")
      .sort({ createdAt: -1 })
      .lean()

    // Calculate average rating
    const avgRating =
      feedbackList.length > 0
        ? feedbackList.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackList.length
        : 0

    return NextResponse.json({
      feedback: feedbackList,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: feedbackList.length,
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

// ── POST /api/feedback  → submit a rating+comment for a player ──
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const { recipientId, rating, comment } = body

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json({ error: "Valid recipientId is required" }, { status: 400 })
    }
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 })
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Upsert — allow updating an existing review
    const feedback = await Feedback.findOneAndUpdate(
      { sender: session.user.id, recipient: recipientId },
      { rating, comment: comment || "", updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("sender", "name image")

    return NextResponse.json(
      { message: "Feedback submitted successfully", feedback },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
