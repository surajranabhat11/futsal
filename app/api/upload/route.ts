import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File exceeds 5MB" }, { status: 400 })

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Images only" }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url }, { status: 201 })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}