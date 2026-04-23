import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { status } = await request.json()
    
    // Players can only cancel their own bookings, and only if they are not already completed or cancelled
    if (status !== 'cancelled') {
      return NextResponse.json({ error: "Invalid status update for player" }, { status: 400 })
    }

    await dbConnect()

    const booking = await Booking.findOne({ _id: params.id, userId: session.user.id })
    if (!booking) {
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 })
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return NextResponse.json({ error: `Cannot cancel a booking that is already ${booking.status}` }, { status: 400 })
    }

    // Refund logic: if paid, mark as refund_pending
    const updateData: any = { status: 'cancelled' }
    if (booking.paymentStatus === 'paid') {
      updateData.paymentStatus = 'refund_pending'
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
