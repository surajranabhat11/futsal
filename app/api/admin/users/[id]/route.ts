import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id ?? request.nextUrl.pathname.split("/").pop()

  const client = await clientPromise
  const db = client.db("test")
  await db.collection("users").deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { role } = await request.json()
    if (!['player', 'owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const id = params.id ?? request.nextUrl.pathname.split("/").pop()

    const client = await clientPromise
    const db = client.db("test")
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}