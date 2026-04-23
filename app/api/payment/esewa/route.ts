import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { amount, bookingId } = await request.json()

    if (!amount || !bookingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use eSewa test credentials (in production, use environment variables)
    const SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"
    const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST"
    
    // We append bookingId to UUID to easily retrieve it during verification if needed, 
    // or we can store the UUID in the Booking model. 
    // Let's use the bookingId as part of the transaction UUID so we know what booking it is.
    const transaction_uuid = `${bookingId}-${uuidv4()}`

    // eSewa message format: total_amount=100,transaction_uuid=uuid,product_code=EPAYTEST
    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${PRODUCT_CODE}`
    
    // Generate signature
    const hash = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('base64')

    const paymentData = {
      amount: amount,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings?status=failure`,
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: PRODUCT_CODE,
      signature: hash,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/esewa/verify`,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: transaction_uuid
    }

    return NextResponse.json({ paymentData })
  } catch (error) {
    console.error("Error generating eSewa signature:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
