import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import Venue from "@/models/Venue"

export async function PATCH(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params // ✅ await params
    const { status } = await request.json()

    await dbConnect()

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // ✅ Owner flow — confirm or reject
    if (session.user.role === "owner") {
      const venue = await Venue.findOne({
        _id: booking.venueId,
        createdBy: session.user.id,
      })

      if (!venue) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (!["confirmed", "rejected", "completed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      const updated = await Booking.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      )
      return NextResponse.json({ success: true, booking: updated })
    }

    // ✅ Player flow — cancel only
    if (status !== "cancelled") {
      return NextResponse.json({ error: "Players can only cancel bookings" }, { status: 400 })
    }

    if (booking.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json({ error: `Cannot cancel a booking that is already ${booking.status}` }, { status: 400 })
    }

    const updateData: any = { status: "cancelled" }
    if (booking.paymentStatus === "paid") {
      updateData.paymentStatus = "refund_pending"
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    return NextResponse.json({ success: true, booking: updated })

  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}