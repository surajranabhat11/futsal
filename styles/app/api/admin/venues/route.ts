import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await dbConnect()
  const search = request.nextUrl.searchParams.get("search") || ""
  const query = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { address: { $regex: search, $options: "i" } }] }
    : {}

  const venues = await Venue.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  return NextResponse.json({ venues })
}
