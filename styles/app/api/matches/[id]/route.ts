import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { updateMatchSchema } from "@/lib/validations";
import { findMatchById, updateMatch } from "@/lib/db-utils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid match ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const match = await findMatchById(id);

    if (!match) {
      return new Response(JSON.stringify({ error: "Match not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ match }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching match:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch match" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matchId = params.id;
    const body = await request.json();

    const result = updateMatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const match = await findMatchById(matchId);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (
      match.creatorId !== session.user.id &&
      match.opponentId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await updateMatch(matchId, result.data);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update match" },
        { status: 500 }
      );
    }

    const client = await import("@/lib/mongodb").then(
      (module) => module.default
    );
    const db = client.db("futsal_matcher");

    const recipientId =
      match.creatorId === session.user.id ? match.opponentId : match.creatorId;

    await db.collection("notifications").insertOne({
      recipientId,
      senderId: session.user.id,
      senderName: session.user.name,
      type: "match_update",
      matchId,
      content: `${session.user.name} has ${result.data.status} your match`,
      createdAt: new Date(),
      read: false,
    });

    return NextResponse.json({ message: "Match updated successfully" });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
