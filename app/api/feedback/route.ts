import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { createFeedbackSchema } from "@/lib/validations"
import { createFeedback, findFeedbackByRecipient } from "@/lib/db-utils"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const feedback = await findFeedbackByRecipient(userId)

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const result = createFeedbackSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { matchId, recipientId, rating, comment } = result.data

    // Check if feedback already exists
    const client = await import("@/lib/mongodb").then((module) => module.default)
    const db = client.db("futsal_matcher")

    const existingFeedback = await db.collection("feedback").findOne({
      matchId,
      senderId: session.user.id,
      recipientId,
    })

    if (existingFeedback) {
      return NextResponse.json({ error: "Feedback already submitted for this match" }, { status: 409 })
    }

    // Create feedback
    const feedback = await createFeedback({
      matchId,
      senderId: session.user.id,
      recipientId,
      rating,
      comment,
      createdAt: new Date(),
    })

    // Create notification for recipient
    await db.collection("notifications").insertOne({
      recipientId,
      senderId: session.user.id,
      senderName: session.user.name,
      type: "feedback",
      matchId,
      content: `${session.user.name} has left feedback for your match`,
      createdAt: new Date(),
      read: false,
    })

    return NextResponse.json(
      {
        message: "Feedback submitted successfully",
        feedbackId: feedback._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
