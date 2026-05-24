import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import TeamChallenge from "@/models/TeamChallenge";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    const [receivedChallenges, sentChallenges] = await Promise.all([
      TeamChallenge.find({
        recipient: session.user.id,
        $or: [
          { "matchDetails.date": { $gte: new Date() } },
          { status: "accepted" }
        ]
      })
        .populate({ path: "sender", model: User, select: "name email image" })
        .sort({ createdAt: -1 }),
      TeamChallenge.find({
        sender: session.user.id,
        $or: [
          { "matchDetails.date": { $gte: new Date() } },
          { status: "accepted" }
        ]
      })
        .populate({ path: "recipient", model: User, select: "name email image" })
        .sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({ received: receivedChallenges, sent: sentChallenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

// ✅ add this
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipientId, matchId, matchDetails, message } = await request.json();

    if (!recipientId || !matchId) {
      return NextResponse.json({ error: "recipientId and matchId are required" }, { status: 400 });
    }

    if (recipientId === session.user.id) {
      return NextResponse.json({ error: "You cannot challenge yourself" }, { status: 400 });
    }

    await dbConnect();

    const existing = await TeamChallenge.findOne({
      sender: session.user.id,
      matchId,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json({ error: "You already sent a challenge for this match" }, { status: 409 });
    }

    const challenge = await TeamChallenge.create({
      sender: session.user.id,
      recipient: recipientId,
      matchId,
      matchDetails,
      message: message || "I challenge your team to a match!",
    });

    return NextResponse.json({ success: true, challenge }, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json({ error: "Failed to send challenge" }, { status: 500 });
  }
}