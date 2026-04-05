import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import PlayerInvitation from "@/models/PlayerInvitation"
import TeamChallenge from "@/models/TeamChallenge"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = session.user.id

    // 1. Accepted player invitations (sender OR recipient)
    const acceptedInvitations = await PlayerInvitation.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ],
      status: "accepted"
    }).lean()

    // 2. Accepted team challenges (sender OR recipient)
    const acceptedChallenges = await TeamChallenge.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ],
      status: "accepted"
    }).lean()

    // 3. Collect all unique connected user IDs from both sources
    const connectedUserIds = new Set<string>()

    acceptedInvitations.forEach((inv: any) => {
      connectedUserIds.add(inv.sender.toString())
      connectedUserIds.add(inv.recipient.toString())
    })

    acceptedChallenges.forEach((ch: any) => {
      connectedUserIds.add(ch.sender.toString())
      connectedUserIds.add(ch.recipient.toString())
    })

    // Remove the current user from the list
    connectedUserIds.delete(userId)

    // 4. Fetch user details for all connected users
    const connectedUsers = await User.find(
      { _id: { $in: Array.from(connectedUserIds) } },
      {
        name: 1,
        email: 1,
        image: 1,
        createdAt: 1,
        updatedAt: 1
      }
    ).lean()

    return NextResponse.json({ users: connectedUsers })

  } catch (error) {
    console.error("Error fetching connected users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
