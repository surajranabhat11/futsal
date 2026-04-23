import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters", { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec()
    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    // Return success but don't include password
    const { password: _, ...userWithoutPassword } = user.toObject()
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 