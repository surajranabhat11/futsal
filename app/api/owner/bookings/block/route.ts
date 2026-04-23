import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import Venue from "@/models/Venue"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { venueId, date, startTime, endTime, reason } = await request.json()

    if (!venueId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Verify ownership
    const venue = await Venue.findOne({ _id: venueId, createdBy: session.user.id })
    if (!venue) {
      return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 404 })
    }

    // Check for existing bookings that are confirmed or pending
    const existingBookings = await Booking.find({
      venueId,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ],
      status: { $in: ['confirmed', 'pending'] }
    })

    if (existingBookings.length > 0) {
      return NextResponse.json({ 
        error: "Cannot block this slot: There are existing bookings during this time.",
        bookings: existingBookings 
      }, { status: 409 })
    }

    const newBlock = new Booking({
      venueId,
      userId: session.user.id,
      playerPhone: "OWNER_BLOCK",
      date: new Date(date),
      startTime,
      endTime,
      totalAmount: 0,
      status: 'blocked',
      paymentStatus: 'paid', // Effectively "paid" since it's a block
      paymentMethod: 'cash',
      transactionId: `BLOCK_${reason || 'Maintenance'}`
    })

    await newBlock.save()

    return NextResponse.json({ success: true, booking: newBlock }, { status: 201 })
  } catch (error) {
    console.error("Error blocking slot:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
