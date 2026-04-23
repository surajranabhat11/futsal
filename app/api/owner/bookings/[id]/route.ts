import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import Venue from "@/models/Venue"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { status, paymentStatus } = await request.json()
    
    await dbConnect()

    const booking = await Booking.findById(params.id).populate('venueId')
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.venueId.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized: You do not own this venue" }, { status: 403 })
    }

    const updateFields: any = {}
    if (status) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateFields.status = status
    }

    if (paymentStatus) {
      if (!['pending', 'paid', 'failed', 'refunded', 'refund_pending'].includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
      }
      updateFields.paymentStatus = paymentStatus
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      params.id,
      { $set: updateFields },
      { new: true }
    )

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
