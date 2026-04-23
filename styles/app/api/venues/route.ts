import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
// import { createVenueSchema } from "@/lib/validations"
// import { createVenue, findVenuesByLocation, findVenuesByName } from "@/lib/db-utils"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    // Session check might not be strictly needed for just browsing venues,
    // but keeping it for consistency or if user-specific results are needed later.
    const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const longitudeStr = searchParams.get("longitude")
    const latitudeStr = searchParams.get("latitude")
    const distanceStr = searchParams.get("distance")

    let query: any = {}

    if (name) {
      query.name = new RegExp(name, 'i') // Case-insensitive regex search
    }

    if (longitudeStr && latitudeStr) {
        const longitude = parseFloat(longitudeStr);
        const latitude = parseFloat(latitudeStr);
        // Default distance 10km (10000 meters)
        const maxDistance = distanceStr ? parseInt(distanceStr) : 10000;

        if (!isNaN(longitude) && !isNaN(latitude)) {
            query.location = {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: maxDistance
                }
            }
        }
    }

    // Execute the query
    const venues = await Venue.find(query)
      .populate('createdBy', 'name image') // Populate creator info
      .lean()

    return NextResponse.json({ venues })
  } catch (error) {
    console.error("Error fetching venues:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()

    // Basic validation (can be enhanced)
    const { name, address, location, description, amenities, openingHours } = body
    if (!name || !address) {
        return new NextResponse("Missing required fields (name, address)", { status: 400 })
    }

    // Validate location format if provided
    let locationData = undefined;
    if (location?.type === 'Point' && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        locationData = {
            type: 'Point',
            coordinates: [parseFloat(location.coordinates[0]), parseFloat(location.coordinates[1])]
        };
        if (isNaN(locationData.coordinates[0]) || isNaN(locationData.coordinates[1])) {
            return new NextResponse("Invalid location coordinates", { status: 400 });
        }
    }

    await dbConnect()

    // Create venue
    const newVenue = await Venue.create({
      name,
      address,
      location: locationData,
      description,
      amenities,
      openingHours,
      createdBy: userId,
    })

    const populatedVenue = await Venue.findById(newVenue._id)
        .populate('createdBy', 'name image')
        .lean();

    return NextResponse.json(populatedVenue, { status: 201 })
  } catch (error) {
    console.error("Error creating venue:", error)
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(error.message, { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
