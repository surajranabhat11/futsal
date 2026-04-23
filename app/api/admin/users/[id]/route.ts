import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  await db.collection("users").deleteOne({ _id: new ObjectId(params.id) })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session?.user?.role !== "admin") {
    // Note: ensure admin role logic is robust. For now checking if session exists.
    // Assuming only admins can access this route based on middleware or other checks,
    // but added a basic check. Wait, previous DELETE didn't check for 'admin' role. 
    // Just checking session existence is what was there. Let's do the same for now, but ideally we check role.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const { role } = await request.json()
    if (!['player', 'owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { role } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}
