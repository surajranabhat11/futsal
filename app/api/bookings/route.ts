import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import Venue from "@/models/Venue"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await dbConnect()
    const bookings = await Booking.find({ userId: session.user.id })
      .populate('venueId', 'name address phone')
      .sort({ createdAt: -1 })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching player bookings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { venueId, date, startTime, endTime, playerPhone, paymentMethod = 'esewa' } = await request.json()

    if (!venueId || !date || !startTime || !endTime || !playerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const venue = await Venue.findById(venueId)
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    // Basic conflict check
    const existingBooking = await Booking.findOne({
      venueId,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ],
      status: { $in: ['confirmed', 'pending', 'blocked'] }
    })

    if (existingBooking) {
      // If courts > 1, we should count overlapping bookings and compare with courts available
      // For simplicity, doing a direct check. Can be expanded based on courts.
      const overlapCount = await Booking.countDocuments({
        venueId,
        date: new Date(date),
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ],
        status: { $in: ['confirmed', 'pending', 'completed', 'blocked'] } // Check all non-cancelled
      })

      if (overlapCount >= (venue.courts || 1)) {
        return NextResponse.json({ error: "Time slot is fully booked" }, { status: 409 })
      }
    }

    // Calculate duration in hours (simplified calculation assuming format HH:mm)
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])
    const duration = endHour - startHour

    if (duration <= 0) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 400 })
    }

    const totalAmount = venue.pricePerHour * duration

    const newBooking = new Booking({
      venueId,
      userId: session.user.id,
      playerPhone,
      date: new Date(date),
      startTime,
      endTime,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod
    })

    await newBooking.save()

    return NextResponse.json({ booking: newBooking }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
