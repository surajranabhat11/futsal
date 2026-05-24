import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const id = params.id ?? request.nextUrl.pathname.split("/").pop()
    console.log("Looking for venue ID:", id)
    
    if (!id) {
      return NextResponse.json({ error: "No ID provided" }, { status: 400 })
    }

    const venue = await Venue.findById(id)
    console.log("Found venue:", venue ? "yes" : "null")
    
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }
    return NextResponse.json({ venue }, { status: 200 })
  } catch (error) {
    console.error("Error fetching venue:", error)
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 })
  }
}