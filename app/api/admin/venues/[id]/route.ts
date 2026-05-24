import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params // ✅ await params (Next.js 15 fix)

  await dbConnect()

  const venue = await Venue.findById(id)

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 })
  }

  // ✅ check the venue belongs to this owner
  if (venue.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await Venue.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}