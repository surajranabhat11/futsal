import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await dbConnect()
  await Venue.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const venue = await Venue.findById(params.id).lean()
    
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }
    
    // Convert ObjectId to string if necessary, though lean usually does okay, but let's just return it as json.
    // The previous frontend code assumes `data.venue`.
    return NextResponse.json({ venue })
  } catch (error) {
    console.error("Error fetching venue:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

