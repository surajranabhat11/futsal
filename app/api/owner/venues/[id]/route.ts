import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function PATCH(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    console.log("PATCH id:", id)

    const body = await request.json()
    console.log("Body:", body)

    await dbConnect()

    const venue = await Venue.findById(id)
    console.log("Venue:", venue)

    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 })

    if (!venue.owner || venue.owner.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await Venue.findByIdAndUpdate(
      id,
      { $set: { name: body.name, address: body.address, pricePerHour: body.pricePerHour, courts: body.courts, description: body.description, image: body.image, phone: body.phone } },
      { new: true }
    )
    console.log("Updated:", updated)

    return NextResponse.json({ success: true, venue: updated })

  } catch (error: any) {
    console.error("PATCH /venues/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params

  await dbConnect()

  const venue = await Venue.findById(id)

  if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 })

  if (!venue.owner || venue.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await Venue.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}