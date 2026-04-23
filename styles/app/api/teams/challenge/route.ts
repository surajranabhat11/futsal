import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import TeamChallenge from "@/models/TeamChallenge";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, matchDetails, message } = await request.json();
    if (!recipientId || !matchDetails) {
      return NextResponse.json(
        { error: "Recipient ID and match details are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    console.log("Database connection established");

    // Check if challenge already exists
    const existingChallenge = await TeamChallenge.findOne({
      sender: session.user.id,
      recipient: recipientId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingChallenge) {
      return NextResponse.json(
        { error: "Challenge already sent" },
        { status: 400 }
      );
    }

    // Create new challenge
    const challenge = new TeamChallenge({
      sender: session.user.id,
      recipient: recipientId,
      matchDetails,
      message: message || "I challenge your team to a match!",
      status: "pending",
    });

    await challenge.save();

    return NextResponse.json({
      message: "Challenge sent successfully",
      challenge,
    });
  } catch (error) {
    console.error("Error sending team challenge:", error);
    return NextResponse.json(
      { error: "Failed to send challenge" },
      { status: 500 }
    );
  }
} 