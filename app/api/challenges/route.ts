import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import TeamChallenge from "@/models/TeamChallenge"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await dbConnect()
  const status = request.nextUrl.searchParams.get("status")
  const query = status && status !== "all" ? { status } : {}

  const challenges = await TeamChallenge.find(query)
    .populate("sender", "name email")
    .populate("recipient", "name email")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  return NextResponse.json({ challenges })
}

export async function POST(request: NextRequest) { // ✅ add this
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { recipientId, matchId, matchDetails, message } = await request.json()

  if (!recipientId || !matchId) {
    return NextResponse.json({ error: "recipientId and matchId are required" }, { status: 400 })
  }

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "You cannot challenge yourself" }, { status: 400 })
  }

  await dbConnect()

  const existing = await TeamChallenge.findOne({
    sender: session.user.id,
    matchId,
    status: "pending",
  })

  if (existing) {
    return NextResponse.json({ error: "You already sent a challenge for this match" }, { status: 409 })
  }

  const challenge = await TeamChallenge.create({
    sender: session.user.id,
    recipient: recipientId,
    matchId,
    matchDetails,
    message: message || "I challenge your team to a match!",
  })

  return NextResponse.json({ success: true, challenge }, { status: 201 })
}