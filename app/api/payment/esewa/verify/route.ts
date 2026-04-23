import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect.ts"
import Booking from "@/models/Booking.ts"

export async function GET(request: NextRequest) {
  try {
    const data = request.nextUrl.searchParams.get("data")
    if (!data) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings?status=failure`)
    }

    // Decode the base64 data returned by eSewa
    const decodedData = Buffer.from(data, "base64").toString("utf-8")
    const parsedData = JSON.parse(decodedData)

    if (parsedData.status !== "COMPLETE") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings?status=failure`)
    }

    // Extract booking ID from the transaction_uuid (format: bookingId-uuid)
    const transaction_uuid = parsedData.transaction_uuid
    const bookingId = transaction_uuid.split('-')[0]

    await dbConnect()

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings?status=error`)
    }

    // Update booking payment status
    booking.paymentStatus = "paid"
    booking.status = "confirmed" // Auto-confirm on successful payment
    booking.transactionId = parsedData.transaction_code // eSewa transaction code
    await booking.save()

    // Redirect to bookings page with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings?status=success`)
  } catch (error) {
    console.error("Error verifying eSewa payment:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings?status=error`)
  }
}
