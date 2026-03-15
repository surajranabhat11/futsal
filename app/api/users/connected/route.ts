import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import PlayerInvitation from "@/models/PlayerInvitation"

export async function GET(request: Request) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Connect to database
    await dbConnect()

    // 3. Find all accepted invitations where the current user is either sender or recipient
    const acceptedInvitations = await PlayerInvitation.find({
      $or: [
        { sender: session.user.id },
        { recipient: session.user.id }
      ],
      status: "accepted"
    }).lean()

    // 4. Get unique user IDs from the invitations
    const connectedUserIds = new Set()
    acceptedInvitations.forEach(invitation => {
      connectedUserIds.add(invitation.sender.toString())
      connectedUserIds.add(invitation.recipient.toString())
    })
    connectedUserIds.delete(session.user.id) // Remove current user

    // 5. Fetch connected users
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

    // 6. Return successful response
    return NextResponse.json({ users: connectedUsers })

  } catch (error) {
    console.error("Error fetching connected users:", error)
    
    // 7. Return error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 