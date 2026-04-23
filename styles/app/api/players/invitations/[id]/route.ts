import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import PlayerInvitation from "@/models/PlayerInvitation";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    console.log("Database connection established");

    // Find the invitation and verify the recipient
    const invitation = await PlayerInvitation.findOne({
      _id: params.id,
      recipient: session.user.id,
      status: "pending",
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already processed" },
        { status: 404 }
      );
    }

    // Update the invitation status
    invitation.status = status;
    await invitation.save();

    return NextResponse.json({
      message: `Invitation ${status}`,
      invitation,
    });
  } catch (error) {
    console.error("Error updating invitation:", error);
    return NextResponse.json(
      { error: "Failed to update invitation" },
      { status: 500 }
    );
  }
} 