import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import Match from "@/models/Match";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    console.log("Search params:", Object.fromEntries(searchParams.entries()));

    const location = searchParams.get("location");
    const teamSize = searchParams.get("teamSize");

    await dbConnect();

    const query: any = {
      createdBy: { $ne: session.user.id },

      status: "open",
    };

    if (location && location !== "") {
      query.location = { $regex: location, $options: "i" };
    }

    if (teamSize && teamSize !== "") {
      const teamSizeNum = parseInt(teamSize);
      if (!isNaN(teamSizeNum)) {
        query.teamSize = teamSizeNum;
      }
    }

    console.log("Simplified query:", JSON.stringify(query, null, 2));

    const matches = await Match.find(query)
      .populate("createdBy", "name image")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(
      `Found ${matches.length} matches with location: "${location}" and teamSize: "${teamSize}"`
    );

    if (matches.length === 0) {
      console.log(
        "No matches found. Collection might be empty or query too restrictive."
      );

      const totalMatches = await Match.countDocuments({});
      console.log(`Total matches in database: ${totalMatches}`);

      if (totalMatches > 0) {
        const sampleMatch = await Match.findOne({}).lean();
        console.log("Sample match data:", JSON.stringify(sampleMatch, null, 2));
      }
    }

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error("Error searching matches:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search matches" },
      { status: 500 }
    );
  }
}
