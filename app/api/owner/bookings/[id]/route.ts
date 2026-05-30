import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import Venue from "@/models/Venue"
import Notification from "@/models/Notification"

export async function PATCH(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const { status, paymentStatus } = await request.json()

    await dbConnect()

    const booking = await Booking.findById(id).populate('venueId')
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
      id,
      { $set: updateFields },
      { new: true }
    )

    // ✅ Send notification to the player
    const venueName = booking.venueId?.name || "the venue"
    let notificationContent = ""

    if (status === "confirmed") {
      notificationContent = `Your booking at ${venueName} has been confirmed.`
    } else if (status === "cancelled") {
      notificationContent = `Your booking at ${venueName} has been cancelled by the owner.`
    } else if (status === "completed") {
      notificationContent = `Your booking at ${venueName} has been marked as completed.`
    } else if (paymentStatus === "refunded") {
      notificationContent = `Your refund for the booking at ${venueName} has been processed.`
    } else if (paymentStatus === "refund_pending") {
      notificationContent = `Your refund request for the booking at ${venueName} is being processed.`
    }

    if (notificationContent) {
      await Notification.create({
        recipient: booking.userId,
        sender: session.user.id,
        senderName: session.user.name || "Venue Owner",
        type: "booking_update",
        content: notificationContent,
        read: false,
      })
    }

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}