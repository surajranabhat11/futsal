import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TeamChallenge from "@/models/TeamChallenge";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(request: NextRequest, context: any) { // ✅ context: any
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await context.params; // ✅ await params

    await dbConnect();

    const challenge = await TeamChallenge.findOne({
      _id: id,
      recipient: session.user.id,
      status: "pending",
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found or already processed" }, { status: 404 });
    }

    challenge.status = status;
    await challenge.save();

    await Notification.create({
      recipient: challenge.sender,
      sender: session.user.id,
      senderName: session.user.name || "A team",
      type: `challenge_${status}`,
      content: `has ${status} your match challenge.`,
      link: "/dashboard/matchmaking",
    });

    return NextResponse.json({ message: `Challenge ${status}`, challenge });
  } catch (error) {
    console.error("Error updating challenge:", error);
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}