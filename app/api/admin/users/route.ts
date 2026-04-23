import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  const search = request.nextUrl.searchParams.get("search") || ""
  const query = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {}

  const users = await db
    .collection("users")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .project({ name: 1, email: 1, location: 1, skillLevel: 1, role: 1, createdAt: 1 })
    .toArray()

  return NextResponse.json({ users })
}
