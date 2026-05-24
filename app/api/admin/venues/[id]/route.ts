import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Venue from "@/models/Venue"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = params.id ?? request.nextUrl.pathname.split("/").pop()

  await dbConnect()
  await Venue.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}