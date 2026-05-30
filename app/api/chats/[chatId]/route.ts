import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Chat from "@/models/Chat"
import mongoose from "mongoose"

// GET — fetch chat details with participants
export async function GET(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatId } = await context.params

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 })
    }

    await dbConnect()

    const chat = await Chat.findById(chatId)
      .populate("participants", "name email image")
      .populate("createdBy", "name")
      .lean()

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const isParticipant = chat.participants.some(
      (p: any) => p._id.toString() === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}

// PATCH — add or remove members (creator only)
export async function PATCH(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatId } = await context.params

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 })
    }

    await dbConnect()

    const chat = await Chat.findById(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    if (!chat.isGroupChat) {
      return NextResponse.json({ error: "Only group chats can be updated" }, { status: 400 })
    }

    // Only creator can add/remove members
    if (chat.createdBy?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the group creator can manage members" }, { status: 403 })
    }

    const body = await request.json()
    const { addParticipants, removeParticipants, name } = body

    if (name) {
      chat.name = name
    }

    if (addParticipants && Array.isArray(addParticipants)) {
      for (const id of addParticipants) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const objId = new mongoose.Types.ObjectId(id)
          if (!chat.participants.some((p: any) => p.toString() === id)) {
            chat.participants.push(objId)
          }
        }
      }
    }

    if (removeParticipants && Array.isArray(removeParticipants)) {
      // Cannot remove the creator
      chat.participants = chat.participants.filter(
        (p: any) => !removeParticipants.includes(p.toString()) || p.toString() === session.user.id
      )
    }

    await chat.save()

    const updatedChat = await Chat.findById(chatId)
      .populate("participants", "name email image")
      .populate("createdBy", "name")
      .lean()

    return NextResponse.json({ message: "Chat updated successfully", chat: updatedChat })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}