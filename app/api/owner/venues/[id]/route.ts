import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function PATCH(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params

  const body = await request.json()
  const { name, address, pricePerHour, courts, description, image, phone } = body

  await dbConnect()

  const venue = await Venue.findById(id)

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 })
  }

  if (venue.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await Venue.findByIdAndUpdate(
    id,
    { $set: { name, address, pricePerHour, courts, description, image, phone } },
    { new: true }
  )

  return NextResponse.json({ success: true, venue: updated })
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params

  await dbConnect()

  const venue = await Venue.findById(id)

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 })
  }

  if (venue.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await Venue.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}