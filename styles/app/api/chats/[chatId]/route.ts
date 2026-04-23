import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { updateChatSchema } from "@/lib/validations"
import { findChatById } from "@/lib/db-utils"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatId = params.chatId
    const chat = await findChatById(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Check if user is a participant
    if (!chat.participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const client = await import("@/lib/mongodb").then((module) => module.default)
    const db = client.db("futsal_matcher")

    // For group chats, get all participant details
    if (chat.isGroupChat) {
      const participantDetails = await db
        .collection("users")
        .find(
          { _id: { $in: chat.participants.map((id: string) => new ObjectId(id)) } },
          { projection: { name: 1, email: 1 } },
        )
        .toArray()

      chat.participantDetails = participantDetails
    } else {
      // For direct chats, get the other participant's details
      const otherParticipantId = chat.participants.find((id: string) => id !== session.user.id)

      if (otherParticipantId) {
        const otherParticipant = await db
          .collection("users")
          .findOne({ _id: new ObjectId(otherParticipantId) }, { projection: { name: 1, email: 1 } })

        chat.otherParticipant = otherParticipant
      }
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatId = params.chatId
    const body = await request.json()

    // Validate input
    const result = updateChatSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const chat = await findChatById(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Check if user is a participant and the chat is a group chat
    if (!chat.participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!chat.isGroupChat) {
      return NextResponse.json({ error: "This operation is only allowed for group chats" }, { status: 400 })
    }

    const client = await import("@/lib/mongodb").then((module) => module.default)
    const db = client.db("futsal_matcher")

    // Update operations
    const updateOps: any = {}
    const { name, addParticipants, removeParticipants } = result.data

    if (name) {
      updateOps.name = name
    }

    // Add participants
    if (addParticipants && Array.isArray(addParticipants) && addParticipants.length > 0) {
      // Verify that the participants exist
      const validParticipants = await db
        .collection("users")
        .find({ _id: { $in: addParticipants.map((id: string) => new ObjectId(id)) } })
        .toArray()

      const validParticipantIds = validParticipants.map((p: any) => p._id.toString())

      if (validParticipantIds.length > 0) {
        await db
          .collection("chats")
          .updateOne({ _id: new ObjectId(chatId) }, { $addToSet: { participants: { $each: validParticipantIds } } })

        // Create notifications for new participants
        const notifications = validParticipantIds.map((recipientId) => ({
          recipientId,
          senderId: session.user.id,
          senderName: session.user.name,
          type: "chat_update",
          chatId,
          chatName: chat.name,
          isGroupChat: true,
          content: `${session.user.name} added you to the group "${chat.name}"`,
          createdAt: new Date(),
          read: false,
        }))

        await db.collection("notifications").insertMany(notifications)
      }
    }

    // Remove participants
    if (removeParticipants && Array.isArray(removeParticipants) && removeParticipants.length > 0) {
      // Cannot remove the creator of the group
      const filteredRemoveIds = removeParticipants.filter((id: string) => id !== chat.createdBy)

      if (filteredRemoveIds.length > 0) {
        await db
          .collection("chats")
          .updateOne({ _id: new ObjectId(chatId) }, { $pull: { participants: { $in: filteredRemoveIds } } })
      }
    }

    // Update name if provided
    if (Object.keys(updateOps).length > 0) {
      await db.collection("chats").updateOne({ _id: new ObjectId(chatId) }, { $set: updateOps })
    }

    // Get the updated chat
    const updatedChat = await findChatById(chatId)

    // Get participant details
    const participantDetails = await db
      .collection("users")
      .find(
        { _id: { $in: updatedChat.participants.map((id: string) => new ObjectId(id)) } },
        { projection: { name: 1, email: 1 } },
      )
      .toArray()

    updatedChat.participantDetails = participantDetails

    return NextResponse.json({
      message: "Chat updated successfully",
      chat: updatedChat,
    })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}
