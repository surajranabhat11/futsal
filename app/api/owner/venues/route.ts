import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await dbConnect()
    const venues = await Venue.find({ createdBy: session.user.id }).sort({ createdAt: -1 })
    return NextResponse.json({ venues })
  } catch (error) {
    console.error("Error fetching owner venues:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { name, address, pricePerHour, courts, description, image, phone } = await request.json()
    await dbConnect()

    const newVenue = new Venue({
      name,
      address,
      pricePerHour: Number(pricePerHour),
      courts: Number(courts),
      description,
      image,
      phone,
      createdBy: session.user.id,
    })

    await newVenue.save()
    return NextResponse.json({ venue: newVenue }, { status: 201 })
  } catch (error) {
    console.error("Error creating venue:", error)
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 })
  }
}
