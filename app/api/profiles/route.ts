import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import Profile from "@/models/Profile";
import User from "@/models/User";
import PlayerInvitation from "@/models/PlayerInvitation";
import { Feedback } from "@/app/api/feedback/route"
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
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

    const transformedProfiles = await Promise.all(profiles.map(async (profile) => {
      const user = profile.user as any;

      // ✅ Check for existing invitation
      const invitation = await PlayerInvitation.findOne({
        sender: session.user.id,
        recipient: user._id,
        status: { $in: ["pending", "accepted"] }
      });

      // ✅ Get average rating from feedback
const feedbackStats = await Feedback.aggregate([
  { $match: { recipient: user._id } },  // ✅ use recipient not to
  {
    $group: {
      _id: null,
      averageRating: { $avg: "$rating" },
      totalRatings: { $sum: 1 },
    },
  },
])

      const rating = feedbackStats[0]?.averageRating
        ? Math.round(feedbackStats[0].averageRating * 10) / 10
        : null
      const totalRatings = feedbackStats[0]?.totalRatings || 0

      return {
        ...profile,
        invited: !!invitation,
        rating,
        totalRatings,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      };
    }));

    return NextResponse.json({ profiles: transformedProfiles });
  } catch (error) {
    console.error("Error searching profiles:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}