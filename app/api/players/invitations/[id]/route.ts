import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PlayerInvitation from "@/models/PlayerInvitation";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await context.params;

    await dbConnect();

    const invitation = await PlayerInvitation.findOne({
      _id: id,
      recipient: session.user.id,
      status: "pending",
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found or already processed" }, { status: 404 });
    }

    invitation.status = status;
    await invitation.save();

    await Notification.create({
      recipient: invitation.sender,
      sender: session.user.id,
      senderName: session.user.name || "A user",
      type: `invitation_${status}`,
      content: `has ${status} your squad invitation.`,
      link: "/dashboard/matchmaking",
    });

    return NextResponse.json({ message: `Invitation ${status}`, invitation });
  } catch (error) {
    console.error("Error updating invitation:", error);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}

// ✅ unfriend — delete the accepted invitation
export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await dbConnect();

    // Only allow deletion if user is sender or recipient
    const invitation = await PlayerInvitation.findOne({
      _id: id,
      $or: [
        { sender: session.user.id },
        { recipient: session.user.id },
      ],
    });

    if (!invitation) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    await PlayerInvitation.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Connection removed" });
  } catch (error) {
    console.error("Error removing connection:", error);
    return NextResponse.json({ error: "Failed to remove connection" }, { status: 500 });
  }
}