import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return null
  }
  return session
}

export async function PATCH(request: NextRequest, context: any) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const { role } = await request.json()

  if (!["player", "owner", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db("test")

  await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: { role } }
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const client = await clientPromise
  const db = client.db("test")

  await db.collection("users").deleteOne({ _id: new ObjectId(id) })

  return NextResponse.json({ ok: true })
}
