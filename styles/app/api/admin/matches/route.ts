import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  const status = request.nextUrl.searchParams.get("status")
  const query = status && status !== "all" ? { status } : {}

  const matches = await db
    .collection("matches")
    .aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByUser",
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      {
        $addFields: {
          createdBy: { $arrayElemAt: ["$createdByUser", 0] },
        },
      },
      { $unset: "createdByUser" },
    ])
    .toArray()

  return NextResponse.json({ matches })
}
