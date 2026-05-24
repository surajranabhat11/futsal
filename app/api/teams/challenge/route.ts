import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TeamChallenge from "@/models/TeamChallenge";
import Notification from "@/models/Notification";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, matchId, matchDetails, message } = await request.json();
    if (!recipientId || !matchId || !matchDetails) {
      return NextResponse.json(
        { error: "recipientId, matchId, and matchDetails are required" },
        { status: 400 }
      );
    }

    // Prevent self-challenge
    if (recipientId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot challenge your own team" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate recipient exists
    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if challenge already exists
    const existingChallenge = await TeamChallenge.exists({
      sender: session.user.id,
      matchId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingChallenge) {
      return NextResponse.json(
        { error: "An active challenge for this match already exists" },
        { status: 409 } // 409 Conflict is more accurate than 400
      );
    }

    // Create challenge and notification in parallel
    const senderName = session.user.name ?? "A team";
    const [challenge] = await Promise.all([
      TeamChallenge.create({
        sender: session.user.id,
        recipient: recipientId,
        matchId,
        matchDetails,
        message: message || "I challenge your team to a match!",
        status: "pending",
      }),
      Notification.create({
        recipient: recipientId,
        sender: session.user.id,
        type: "match_invite",
        content: `${senderName} challenged you to a match!`,
        link: "/dashboard#team-challenges",
      }),
    ]);

    return NextResponse.json(
      { message: "Challenge sent successfully", challenge },
      { status: 201 } // 201 Created is more accurate than 200
    );
  } catch (error) {
    console.error("[POST /api/team-challenges]", error);
    return NextResponse.json(
      { error: "Failed to send challenge" },
      { status: 500 }
    );
  }
}