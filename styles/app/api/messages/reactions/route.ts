import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId, reaction } = await request.json()

    if (!messageId || !reaction) {
      return NextResponse.json({ error: "Message ID and reaction are required" }, { status: 400 })
    }

    const client = await import("@/lib/mongodb").then((module) => module.default)
    const db = client.db("futsal_matcher")

    // Get the message to check if it exists and to get the chat ID
    const message = await db.collection("messages").findOne({ _id: new ObjectId(messageId) })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is a participant in the chat
    const chat = await db.collection("chats").findOne({ _id: new ObjectId(message.chatId) })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    if (!chat.participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if user has already reacted with this emoji
    const reactionKey = `reactions.${reaction}`
    const userReacted =
      message.reactions && message.reactions[reaction] && message.reactions[reaction].includes(session.user.id)

    let updateOperation
    if (userReacted) {
      // Remove the reaction
      updateOperation = {
        $pull: { [`reactions.${reaction}`]: session.user.id },
      }
    } else {
      // Add the reaction
      updateOperation = {
        $addToSet: { [`reactions.${reaction}`]: session.user.id },
      }
    }

    // Update the message with the reaction
    await db.collection("messages").updateOne({ _id: new ObjectId(messageId) }, updateOperation)

    // Get the updated message
    const updatedMessage = await db.collection("messages").findOne({ _id: new ObjectId(messageId) })

    return NextResponse.json({
      message: userReacted ? "Reaction removed" : "Reaction added",
      messageId,
      reactions: updatedMessage.reactions,
    })
  } catch (error) {
    console.error("Error updating reaction:", error)
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 })
  }
}
