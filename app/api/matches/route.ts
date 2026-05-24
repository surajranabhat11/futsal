import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Match from "@/models/Match";
import TeamChallenge from "@/models/TeamChallenge";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/lib/auth";
import type { FilterQuery } from "mongoose";

// -------------------------
// POST /api/matches
// -------------------------
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate and parse dateTime early so we can gate on it
    const matchDateTime = new Date(`${data.date}T${data.time}:00+05:45`);
    if (isNaN(matchDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    // Block past matches
    if (matchDateTime <= new Date()) {
      return NextResponse.json(
        { error: "Match date and time must be in the future" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingMatch = await Match.exists({
      createdBy: session.user.id,
      location: data.location,
      dateTime: matchDateTime,
      teamSize: data.teamSize,
      status: "open",
    });

    if (existingMatch) {
      return NextResponse.json(
        { error: "You have already hosted a match with these same details" },
        { status: 409 }
      );
    }

    const match = await Match.create({
      createdBy: session.user.id,
      type: data.type,
      location: data.location,  // removed duplicate venue field
      dateTime: matchDateTime,
      teamSize: data.teamSize,
      isSkillBased: data.isSkillBased,
      positionsNeeded: data.positionsNeeded ?? [],
      skillLevel: data.skillLevel,
      players: [session.user.id],
    });

    return NextResponse.json({ success: true, match }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/matches]", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}

// -------------------------
// GET /api/matches
// -------------------------
interface MatchQuery extends FilterQuery<typeof Match> {
  createdBy: object;
  status: string;
  type: string;
  dateTime: object;
  teamSize?: number;
  isSkillBased?: boolean;
  location?: object;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "opponents";
    const location = searchParams.get("location")?.trim();
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const teamSizeParam = searchParams.get("teamSize");
    const isSkillBased = searchParams.get("isSkillBased") === "true";
    const skillLevel = searchParams.get("skillLevel");

    await dbConnect();

    const query: MatchQuery = {
      createdBy: { $ne: session.user.id },
      status: "open",
      type,
      dateTime: { $gte: new Date() }, // default: all future matches
    };

    if (teamSizeParam) {
      const teamSize = parseInt(teamSizeParam, 10);
      if (!isNaN(teamSize)) query.teamSize = teamSize;
    }

    if (isSkillBased) query.isSkillBased = true;
    if (skillLevel) query.skillLevel = skillLevel;

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Date filter overwrites the default dateTime — intentional and explicit
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }

      if (time) {
        // Narrow to a 1-hour window around the requested time
        const [hours, minutes] = time.split(":").map(Number);
        const timeStart = new Date(dateObj);
        timeStart.setHours(hours, minutes, 0, 0);
        const timeEnd = new Date(timeStart);
        timeEnd.setHours(timeStart.getHours() + 1);
        query.dateTime = { $gte: timeStart, $lt: timeEnd };
      } else {
        // Cover the full calendar day
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        query.dateTime = { $gte: dateObj, $lt: nextDay };
      }
    }

    const matchesRaw = await Match.find(query)
      .populate("createdBy", "name image")
      .sort({ dateTime: 1 })
      .limit(10)
      .lean();

    // Single-query challenge check (fixes N+1)
    const matchIds = matchesRaw.map((m: any) => m._id);
    const activeChallenges = await TeamChallenge.find({
      sender: session.user.id,
      matchId: { $in: matchIds }, // correct field — not recipient
      status: { $in: ["pending", "accepted"] },
    })
      .select("matchId")
      .lean();

    const challengedIds = new Set(
      activeChallenges.map((c: any) => c.matchId.toString())
    );

    const matches = matchesRaw.map((match: any) => ({
      ...match,
      challenged: challengedIds.has(match._id.toString()),
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("[GET /api/matches]", error);
    return NextResponse.json(
      { error: "Failed to search matches" },
      { status: 500 }
    );
  }
}