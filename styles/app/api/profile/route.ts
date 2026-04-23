import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import Profile from "@/models/Profile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  await dbConnect();
  const userId = session?.user?.id;

  try {
    const profile = await Profile.findOne({ user: userId }).populate(
      "user",
      "name email"
    );
    return new Response(JSON.stringify({ profile }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const {
      name,
      phone,
      location,
      bio,
      position,
      skillLevel,
      availability,
      notifications,
    } = body;

    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        location,
        bio,
        position,
        skillLevel,
        availability,
        notifications,
      },
      { new: true }
    )
      .select("-password -__v")
      .lean();

    if (!updated) {
      return new NextResponse("User not found", { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await request.json();
  const userId = session.user.id;

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  try {
    const profile = await Profile.findOneAndUpdate(
      { user: userObjectId },
      {
        $set: {
          ...data,
          user: userObjectId,
        },
      },
      { upsert: true, new: true }
    ).populate("user", "name email");

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
