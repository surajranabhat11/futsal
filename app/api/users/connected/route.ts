import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import PlayerInvitation from "@/models/PlayerInvitation"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = session.user.id

    // ✅ Only use accepted invitations for friends list
    const acceptedInvitations = await PlayerInvitation.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ],
      status: "accepted"
    }).lean()

    const connectedUserIds = new Set<string>()

    acceptedInvitations.forEach((inv: any) => {
      connectedUserIds.add(inv.sender.toString())
      connectedUserIds.add(inv.recipient.toString())
    })

    connectedUserIds.delete(userId)

    const connectedUsers = await User.find(
      { _id: { $in: Array.from(connectedUserIds) } },
      { name: 1, email: 1, image: 1, createdAt: 1, updatedAt: 1 }
    ).lean()

    return NextResponse.json({ users: connectedUsers })

  } catch (error) {
    console.error("Error fetching connected users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}