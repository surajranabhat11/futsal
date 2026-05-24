import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PlayerInvitation from "@/models/PlayerInvitation";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const id = params.id ?? request.nextUrl.pathname.split("/").pop()

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