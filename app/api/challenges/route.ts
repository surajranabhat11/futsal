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
