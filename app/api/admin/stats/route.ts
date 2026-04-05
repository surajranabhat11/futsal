import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Match from "@/models/Match"
import Venue from "@/models/Venue"
import TeamChallenge from "@/models/TeamChallenge"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  const [
    totalUsers,
    totalMatches,
    openMatches,
    completedMatches,
    totalVenues,
    pendingChallenges,
    feedbackAgg,
    recentUsers,
    recentMatches,
  ] = await Promise.all([
    User.countDocuments(),
    Match.countDocuments(),
    Match.countDocuments({ status: "open" }),
    Match.countDocuments({ status: "completed" }),
    Venue.countDocuments(),
    TeamChallenge.countDocuments({ status: "pending" }),
    db.collection("feedback").aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]).toArray(),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt").lean(),
    Match.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name").select("venue status dateTime createdBy").lean(),
  ])

  const feedbackStats = feedbackAgg[0] || { avg: 0, count: 0 }

  return NextResponse.json({
    totalUsers,
    totalMatches,
    openMatches,
    completedMatches,
    totalVenues,
    pendingChallenges,
    totalFeedback: feedbackStats.count,
    avgRating: feedbackStats.avg,
    recentUsers,
    recentMatches,
  })
}
