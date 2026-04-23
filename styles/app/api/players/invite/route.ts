import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import PlayerInvitation from "@/models/PlayerInvitation";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, message } = await request.json();
    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("Database connection established");

    // Convert string IDs to ObjectIds
    const senderId = new mongoose.Types.ObjectId(session.user.id);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    // Verify recipient exists
    const recipient = await User.findById(recipientObjectId);
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await PlayerInvitation.findOne({
      sender: senderId,
      recipient: recipientObjectId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 }
      );
    }

    // Create new invitation
    const invitation = new PlayerInvitation({
      sender: senderId,
      recipient: recipientObjectId,
      message: message || "Would you like to join my team?",
      status: "pending",
    });

    await invitation.save();

    // Populate the sender and recipient data
    const populatedInvitation = await PlayerInvitation.findById(invitation._id)
      .populate({
        path: "sender",
        model: User,
        select: "name email image position skillLevel",
      })
      .populate({
        path: "recipient",
        model: User,
        select: "name email image position skillLevel",
      });

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation: populatedInvitation,
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
} 