import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

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

    // 3. Fetch users (excluding current user and password fields)
    const users = await User.find(
      { _id: { $ne: session.user.id } },  // Exclude current user
      { 
        name: 1,
        email: 1,
        image: 1,
        createdAt: 1,
        updatedAt: 1 
      }
    ).lean()

    // 4. Return successful response
    return NextResponse.json({ users })

  } catch (error) {
    console.error("Error fetching users:", error)
    
    // 5. Return error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}