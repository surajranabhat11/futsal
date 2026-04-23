import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import PlayerInvitation from "@/models/PlayerInvitation";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log("Database connection established");

    // Convert string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Fetch both sent and received invitations with populated user data
    const [receivedInvitations, sentInvitations] = await Promise.all([
      PlayerInvitation.find({ recipient: userId })
        .populate({
          path: "sender",
          model: User,
          select: "name email image position skillLevel",
        })
        .populate({
          path: "recipient",
          model: User,
          select: "name email image position skillLevel",
        })
        .sort({ createdAt: -1 })
        .lean(),
      PlayerInvitation.find({ sender: userId })
        .populate({
          path: "sender",
          model: User,
          select: "name email image position skillLevel",
        })
        .populate({
          path: "recipient",
          model: User,
          select: "name email image position skillLevel",
        })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    console.log("User ID:", userId);
    console.log("Received invitations:", receivedInvitations);
    console.log("Sent invitations:", sentInvitations);

    return NextResponse.json({
      received: receivedInvitations,
      sent: sentInvitations,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
} 