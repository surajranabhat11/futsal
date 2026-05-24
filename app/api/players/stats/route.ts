import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Match from "@/models/Match"
import Message from "@/models/Message"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await dbConnect()
    const userId = session.user.id

    // 1. Count total matches (Created by user OR joined as a player)
    const totalMatches = await Match.countDocuments({
      $or: [
        { createdBy: userId },
        { players: userId }
      ]
    })

    // 2. Count wins (Where winner ID matches user ID)
    const wins = await Match.countDocuments({
      "result.winner": userId
    })

    // 3. Count unread/total messages (This depends on your Message model, assuming one exists)
    // For now, we'll return a count of messages sent to/from the user if the model exists.
    let messages = 0
    try {
        messages = await Message.countDocuments({
            $or: [{ sender: userId }, { recipient: userId }]
        })
    } catch (e) {
        messages = 0 // Fallback if Message model isn't ready
    }

    // 4. Rating (Assuming we fetch from Profile or calculated from Feedback)
    // For now, returning a baseline or fetching from user's profile if available
    const rating = 4.5 // Baseline

    return NextResponse.json({
      totalMatches,
      wins,
      messages,
      rating
    })
  } catch (error) {
    console.error("Error fetching player stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
