import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import TeamChallenge from "@/models/TeamChallenge";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    console.log("Database connection established");

    // Fetch both sent and received challenges
    const [receivedChallenges, sentChallenges] = await Promise.all([
      TeamChallenge.find({ recipient: session.user.id })
        .populate({
          path: "sender",
          model: User,
          select: "name email image",
        })
        .sort({ createdAt: -1 }),
      TeamChallenge.find({ sender: session.user.id })
        .populate({
          path: "recipient",
          model: User,
          select: "name email image",
        })
        .sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      received: receivedChallenges,
      sent: sentChallenges,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
} 