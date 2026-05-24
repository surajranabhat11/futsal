import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Match from "@/models/Match";
import TeamChallenge from "@/models/TeamChallenge";
import dbConnect from "@/lib/dbConnect";
import type { FilterQuery } from "mongoose";

interface MatchQuery extends FilterQuery<typeof Match> {
  createdBy: object;
  status: string;
  dateTime: object;
  location?: object;
  teamSize?: number;
}

const VALID_TEAM_SIZES = [3, 5, 7, 11]; // adjust to your domain
const MATCH_LIMIT = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location")?.trim();
    const teamSizeParam = searchParams.get("teamSize")?.trim();

    await dbConnect();

    // -------------------------
    // MATCH QUERY
    // -------------------------
    const query: MatchQuery = {
      createdBy: { $ne: session.user.id },
      status: "open",
      dateTime: { $gte: new Date() },
    };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (teamSizeParam) {
      const teamSizeNum = parseInt(teamSizeParam, 10);
      if (!isNaN(teamSizeNum) && VALID_TEAM_SIZES.includes(teamSizeNum)) {
        query.teamSize = teamSizeNum;
      } else {
        return NextResponse.json(
          { error: `teamSize must be one of: ${VALID_TEAM_SIZES.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const matchesRaw = await Match.find(query)
      .populate("createdBy", "name image")
      .sort({ dateTime: 1 }) // soonest matches first
      .limit(MATCH_LIMIT)
      .lean();

    // -------------------------
    // SINGLE-QUERY CHALLENGE CHECK (fixes N+1)
    // -------------------------
    const matchIds = matchesRaw.map((m: any) => m._id);

    const activeChallenges = await TeamChallenge.find({
      sender: session.user.id,
      matchId: { $in: matchIds },
      status: { $in: ["pending", "accepted"] },
    })
      .select("matchId")
      .lean();

    const challengedMatchIds = new Set(
      activeChallenges.map((c: any) => c.matchId.toString())
    );

    const matches = matchesRaw.map((match: any) => ({
      ...match,
      challenged: challengedMatchIds.has(match._id.toString()),
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("[GET /api/matches/search]", error);
    return NextResponse.json(
      { error: "Failed to search matches" }, // never expose error.message to client
      { status: 500 }
    );
  }
}