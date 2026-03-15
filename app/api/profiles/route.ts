import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import Profile from "@/models/Profile";
import User from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    console.log("URL:", url);
    const position = url.searchParams.get("position");
    const skillLevel = url.searchParams.get("skillLevel");

    await dbConnect();

    const query: Record<string, any> = {};

    if (position && position !== "any") {
      query.position = position;
    }

    if (skillLevel && skillLevel !== "any") {
      query.skillLevel = skillLevel;
    }

    query.user = { $ne: session.user.id };

    const profiles = await Profile.find(query)
      .populate({
        path: "user",
        model: User,
        select: "_id name email",
      })
      .lean();

    // Transform the profiles to ensure we have the correct user data structure
    const transformedProfiles = profiles.map(profile => {
      const user = profile.user;
      return {
        ...profile,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      };
    });

    console.log("Transformed profiles:", transformedProfiles);

    return NextResponse.json({ profiles: transformedProfiles });
  } catch (error) {
    console.error("Error searching profiles:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
