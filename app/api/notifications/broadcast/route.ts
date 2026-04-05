import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Notification from "@/models/Notification"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, link } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 })

  await dbConnect()

  // Get all user IDs
  const users = await User.find({}).select("_id").lean()

  // Bulk insert a notification for each user
  if (users.length > 0) {
    const notifications = users.map((u) => ({
      recipient: u._id,
      type: "system" as const,
      content: content.trim(),
      link: link?.trim() || undefined,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    await Notification.insertMany(notifications)
  }

  return NextResponse.json({ success: true, sent: users.length })
}
