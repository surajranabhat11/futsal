import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    const headers = new Headers()
    headers.set("Content-Type", "text/event-stream")
    headers.set("Cache-Control", "no-cache")
    headers.set("Connection", "keep-alive")

    const stream = new ReadableStream({
      async start(controller) {
        const db = await getDatabase()

        // Watch for new notifications for this user
        const changeStream = db.collection("notifications").watch([
          {
            $match: {
              "fullDocument.recipient": new ObjectId(userId),
              operationType: "insert",
            },
          },
        ], { fullDocument: "updateLookup" })

        changeStream.on("change", async (change: any) => {
          if (change.operationType === "insert") {
            const notification = change.fullDocument

            // Get sender details
            let senderName = notification.senderName || "System"
            if (notification.sender) {
              const sender = await db.collection("users").findOne(
                { _id: notification.sender },
                { projection: { name: 1 } }
              )
              if (sender?.name) senderName = sender.name
            }

            const data = JSON.stringify({
              type: "notification",
              notification: {
                ...notification,
                _id: notification._id.toString(),
                recipient: notification.recipient?.toString(),
                sender: notification.sender
                  ? { _id: notification.sender.toString(), name: senderName }
                  : null,
                senderName,
              },
            })
            controller.enqueue(`data: ${data}\n\n`)
          }
        })

        changeStream.on("error", (error: Error) => {
          console.error("Notification stream error:", error)
          controller.close()
        })

        req.signal.addEventListener("abort", () => {
          changeStream.close()
          controller.close()
        })
      },
    })

    return new Response(stream, { headers })
  } catch (error) {
    console.error("Error in notification stream:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}