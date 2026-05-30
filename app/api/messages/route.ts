import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Chat from "@/models/Chat"
import Message from "@/models/Message"
import Notification from "@/models/Notification"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return new NextResponse("Valid chat ID is required", { status: 400 })
    }

    await dbConnect()

    const chat = await Chat.findById(chatId).select('name participants').lean()

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 })
    }

    if (!chat.participants.some((id: any) => id.toString() === session.user.id)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name image')
      .sort({ createdAt: 1 })
      .lean()

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: session.user.id },
        readBy: { $nin: [session.user.id] },
      },
      { $addToSet: { readBy: session.user.id } }
    )

    return NextResponse.json({ messages, chatName: chat.name })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const chatId = formData.get("chatId") as string
    const content = (formData.get("content") as string) || ""
    const fileUrl = (formData.get("fileUrl") as string) || null
    const fileName = (formData.get("fileName") as string) || null
    const fileType = (formData.get("fileType") as string) || null

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return new NextResponse("Valid chat ID is required", { status: 400 })
    }

    if (!content.trim() && !fileUrl) {
      return new NextResponse("Message content or file is required", { status: 400 })
    }

    await dbConnect()

    const chat = await Chat.findById(chatId).lean()

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 })
    }

    if (!chat.participants.some((id: any) => id.toString() === session.user.id)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const message = await Message.create({
      chat: chatId,
      sender: session.user.id,
      senderName: session.user.name || "Unknown User",
      content: content || "",
      fileUrl,
      fileType,
      fileName,
      readBy: [session.user.id],
    })

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    })

    const otherParticipants = chat.participants.filter(
      (id: any) => id.toString() !== session.user.id
    )

    if (otherParticipants.length > 0) {
      const notifications = otherParticipants.map((recipientId: any) => ({
        recipient: recipientId,
        sender: session.user.id,
        senderName: session.user.name || "Unknown User",
        type: 'new_message',
        content: content || "Shared a file",
        link: `/dashboard/chat?chatId=${chatId}`,
      }))
      await Notification.insertMany(notifications)
    }

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name image')
      .lean()

    return NextResponse.json(
      { message: "Message sent successfully", messageData: populatedMessage },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error sending message:", error)
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(error.message, { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}