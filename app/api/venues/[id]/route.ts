import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    console.log("Looking for venue ID:", params.id)
    console.log("DB name:", Venue.db.name)
    console.log("Collection name:", Venue.collection.name)
    const venue = await Venue.findById(params.id)
    console.log("Found venue:", venue)
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }
    return NextResponse.json({ venue }, { status: 200 })
  } catch (error) {
    console.error("Error fetching venue:", error)
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 })
  }
}