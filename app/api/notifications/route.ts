import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
// import { findNotificationsByUser, markNotificationsAsRead } from "@/lib/db-utils"
import dbConnect from "@/lib/dbConnect"
import Notification from "@/models/Notification"
import mongoose from "mongoose"

// Get notifications for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10) // Default limit 20
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    await dbConnect()

    let query: any = { recipient: userId }
    if (unreadOnly) {
      query.read = false
    }

    const notifications = await Notification.find(query)
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'name image')
  .lean()

// ✅ sanitize null senders before returning
const sanitizedNotifications = notifications.map((n: any) => ({
  ...n,
  sender: n.sender || null,
  senderName: n.sender?.name || n.senderName || "System",
}))

return NextResponse.json({ notifications: sanitizedNotifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const { notificationIds, all = false } = body

    await dbConnect()

    let filter: any = { recipient: userId }
    let updateResult: any = { modifiedCount: 0 };

    if (all === true) {
      // Mark all notifications for the user as read
      filter.read = false; // Only target unread ones for efficiency
      updateResult = await Notification.updateMany(filter, { $set: { read: true } })
    } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length > 0) {
          filter._id = { $in: validIds };
          filter.read = false; // Only target unread ones
          updateResult = await Notification.updateMany(filter, { $set: { read: true } })
      } else {
          return new NextResponse("No valid notification IDs provided", { status: 400 });
      }
    } else {
        // No valid operation specified
        return new NextResponse("Invalid request: Provide 'notificationIds' array or set 'all' to true.", { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully marked ${updateResult.modifiedCount} notification(s) as read.`,
      modifiedCount: updateResult.modifiedCount
    })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
