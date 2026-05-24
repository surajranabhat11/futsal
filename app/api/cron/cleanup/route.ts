import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import TeamChallenge from "@/models/TeamChallenge"
import PlayerInvitation from "@/models/PlayerInvitation"

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const [deletedChallenges, deletedInvitations] = await Promise.all([
    TeamChallenge.deleteMany({ createdAt: { $lt: oneMonthAgo } }),
    PlayerInvitation.deleteMany({ createdAt: { $lt: oneMonthAgo } }),
  ])

  return NextResponse.json({
    success: true,
    deletedChallenges: deletedChallenges.deletedCount,
    deletedInvitations: deletedInvitations.deletedCount,
  })
}