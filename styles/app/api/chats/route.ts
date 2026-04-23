import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
// import { createChatSchema } from "@/lib/validations"
// import { createChat, findChatsByUser } from "@/lib/db-utils"
// import { ObjectId } from "mongodb"
import dbConnect from "@/lib/dbConnect"
import Chat, { IChat } from "@/models/Chat"
import User from "@/models/User"
import Message from "@/models/Message"
import Notification from "@/models/Notification"
import mongoose, { Types } from "mongoose"

// Define a type for populated participants for clarity
interface PopulatedParticipant {
    _id: Types.ObjectId;
    name?: string | null;
    image?: string | null;
    email?: string | null;
}

interface PopulatedChat extends Omit<IChat, 'participants' | 'lastMessage'> {
    participants: PopulatedParticipant[];
    lastMessage?: {
        _id: Types.ObjectId;
        content: string;
        sender?: { _id: Types.ObjectId; name?: string | null };
        readBy: Types.ObjectId[];
    } | null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect()

    const chats = await Chat.find({ participants: userId })
      .populate<{ participants: PopulatedParticipant[] }>('participants', 'name image email')
      .populate<{ lastMessage: PopulatedChat['lastMessage'] }>({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'name' } // Populate sender name within lastMessage
       })
      .sort({ lastMessageAt: -1 }) // Sort by most recent activity
      .lean<PopulatedChat[]>() // Apply lean with the PopulatedChat type

    // Map results to add 'otherParticipant' for direct chats
    const chatsWithDetails = chats.map(chat => {
        let otherParticipant: PopulatedParticipant | null = null;
        if (!chat.isGroupChat && chat.participants.length === 2) {
            // Ensure userId is treated as string for comparison
            otherParticipant = chat.participants.find(p => p._id.toString() !== userId) || null;
        }
        // Removed unreadCount logic
        return { 
            ...chat, 
            otherParticipant
        };
    });

    return NextResponse.json({ chats: chatsWithDetails })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Removed helper function getUnreadCount as it's no longer used here

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const currentUserName = session?.user?.name; // Get name safely

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { participantIds, name, isGroupChat = false } = body

    if (!participantIds || !Array.isArray(participantIds)) {
        return new NextResponse("participantIds array is required", { status: 400 })
    }

    if (isGroupChat && (!name || typeof name !== 'string' || name.trim() === '')) {
      return new NextResponse("Valid group chat name is required", { status: 400 })
    }

    await dbConnect()

    // Ensure the current user is included and IDs are valid ObjectIds
    const allParticipantObjectIds = [
        new mongoose.Types.ObjectId(userId),
        ...(participantIds
            .filter((id: any): id is string => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && id !== userId)
            .map((id: string) => new mongoose.Types.ObjectId(id)))
    ];

    // Use a Set to ensure uniqueness based on ObjectId string representation
    const uniqueParticipantIds = Array.from(new Set(allParticipantObjectIds.map(id => id.toString())))
                                      .map(idStr => new mongoose.Types.ObjectId(idStr));

    if (uniqueParticipantIds.length < 2) {
        return new NextResponse("At least two unique participants are required", { status: 400 });
    }

    let existingChat = null;
    // For direct chats (not group chats), check if chat already exists
    if (!isGroupChat && uniqueParticipantIds.length === 2) {
      existingChat = await Chat.findOne({
        isGroupChat: { $ne: true },
        participants: { $all: uniqueParticipantIds, $size: 2 },
      })
      .populate<{ participants: PopulatedParticipant[] }>('participants', 'name image email')
      .populate<{ lastMessage: PopulatedChat['lastMessage'] }>({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'name' }
       })
      .lean<PopulatedChat>();

      if (existingChat) {
        const otherParticipant = existingChat.participants.find(p => p._id.toString() !== userId) || null;
        return NextResponse.json({ chat: { ...existingChat, otherParticipant } })
      }
    }

    // Create new chat
    const newChatData: Partial<IChat> = {
      participants: uniqueParticipantIds,
      isGroupChat,
      name: isGroupChat ? name : undefined,
      createdBy: new mongoose.Types.ObjectId(userId),
      lastMessageAt: new Date(),
    }
    const createdChat = await Chat.create(newChatData);

    // Create notifications for *other* participants
    // const otherParticipantIds = uniqueParticipantIds.filter(id => id.toString() !== userId);
    // if (otherParticipantIds.length > 0) {
    //   const notifications = otherParticipantIds.map((recipientId) => ({
    //     recipient: recipientId,
    //     sender: new mongoose.Types.ObjectId(userId),
    //     type: isGroupChat ? "group_chat_invite" : "direct_chat_invite",
    //     content: isGroupChat
    //       ? `${currentUserName || 'Someone'} added you to the group "${name}"` // Use name safely
    //       : `${currentUserName || 'Someone'} started a chat with you`,
    //     link: `/chat/${createdChat._id}`, // Link to the chat
    //     createdAt: new Date(),
    //     read: false,
    //   }))
    //   await Notification.insertMany(notifications)
    // }

    // Fetch the newly created chat with populated fields
    const populatedChat = await Chat.findById(createdChat._id)
        .populate<{ participants: PopulatedParticipant[] }>('participants', 'name image email')
        .lean<PopulatedChat>();

    if (!populatedChat) {
         throw new Error("Failed to retrieve created chat");
    }

    // Map result to add 'otherParticipant' for direct chats
    let finalChat: any = { ...populatedChat };
    if (!populatedChat.isGroupChat) {
        finalChat.otherParticipant = populatedChat.participants.find(p => p._id.toString() !== userId) || null;
    }

    return NextResponse.json(
      {
        message: isGroupChat ? "Group chat created successfully" : "Chat created successfully",
        chat: finalChat,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating chat:", error)
    if (error instanceof mongoose.Error.ValidationError) {
        return new NextResponse(error.message, { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
