import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import Venue from "@/models/Venue"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await dbConnect()
    
    // First, find all venues owned by this user
    const ownerVenues = await Venue.find({ createdBy: session.user.id }).select('_id')
    const venueIds = ownerVenues.map(v => v._id)

    // Then, find bookings for those venues
    const bookings = await Booking.find({ venueId: { $in: venueIds } })
      .populate('userId', 'name email')
      .populate('venueId', 'name')
      .sort({ date: 1, startTime: 1 })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching owner bookings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
