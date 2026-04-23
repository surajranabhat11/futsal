import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Match from "@/models/Match";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    console.log("Received match data:", data);

    const match = new Match({
      createdBy: session.user.id,
      type: data.type,
      location: data.location,
      distance: data.distance,
      dateTime: new Date(`${data.date}T${data.time}`),
      venue: data.location,
      teamSize: data.teamSize,
      isSkillBased: data.isSkillBased,
      positionsNeeded: data.positionsNeeded || [],
      skillLevel: data.skillLevel,
      players: [session.user.id],
    });

    await match.save();

    return NextResponse.json(
      {
        success: true,
        match: match,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create match" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    console.log("Search params:", Object.fromEntries(searchParams.entries()));

    const type = searchParams.get("type") || "opponents";
    const location = searchParams.get("location");
    const distance = parseFloat(searchParams.get("distance") || "0");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const teamSize = parseInt(searchParams.get("teamSize") || "0");
    const isSkillBased = searchParams.get("isSkillBased") === "true";
    const position = searchParams.get("position");
    const skillLevel = searchParams.get("skillLevel");

    await dbConnect();

    const query: any = {
      createdBy: { $ne: session.user.id },

      status: "open",

      type,
    };

    if (teamSize) query.teamSize = teamSize;
    if (isSkillBased) query.isSkillBased = true;

    if (location) {
      query.location = { $regex: location, $options: "i" };

      if (distance) {
        query.distance = { $lte: distance };
      }
    }

    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      query.dateTime = {
        $gte: dateObj,
        $lt: nextDay,
      };

      if (time) {
        const [hours, minutes] = time.split(":").map(Number);

        const timeStart = new Date(dateObj);
        timeStart.setHours(hours, minutes, 0, 0);

        const timeEnd = new Date(timeStart);
        timeEnd.setHours(timeStart.getHours() + 1);

        query.dateTime = {
          $gte: timeStart,
          $lt: timeEnd,
        };
      }
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    const limit = 10;

    const matches = await Match.find(query)
      .populate("createdBy", "name image")
      .sort({ dateTime: 1 })
      .limit(limit)
      .lean();

    console.log(`Found ${matches.length} matches`);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error("Error searching matches:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search matches" },
      { status: 500 }
    );
  }
}
