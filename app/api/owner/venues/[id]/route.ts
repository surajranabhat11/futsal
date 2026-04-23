import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, address, pricePerHour, courts, description, image, phone } = await request.json()
    await dbConnect()

    const updatedVenue = await Venue.findOneAndUpdate(
      { _id: params.id, createdBy: session.user.id },
      { 
        $set: { 
          name, 
          address, 
          pricePerHour: pricePerHour !== undefined ? Number(pricePerHour) : undefined, 
          courts: courts !== undefined ? Number(courts) : undefined, 
          description, 
          image,
          phone
        } 
      },
      { new: true }
    )
    
    if (!updatedVenue) {
      return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ venue: updatedVenue }, { status: 200 })
  } catch (error) {
    console.error("Error updating venue:", error)
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 })
  }
}
