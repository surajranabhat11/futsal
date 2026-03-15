import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { IMessage } from "@/models/Message";

interface ChangeEvent {
  operationType: string;
  fullDocument: IMessage;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chatId = req.nextUrl.searchParams.get("chatId");
    if (!chatId) {
      return new Response("Chat ID is required", { status: 400 });
    }

    // Set up SSE headers
    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    const stream = new ReadableStream({
      async start(controller) {
        // Connect to MongoDB
        const db = await getDatabase();

        // Set up change stream for messages
        const changeStream = db.collection("messages").watch([
          {
            $match: {
              "fullDocument.chat": chatId,
            },
          },
        ]);

        // Handle new messages
        changeStream.on("change", async (change: ChangeEvent) => {
          if (change.operationType === "insert") {
            const message = change.fullDocument;
            
            // Get sender details
            const sender = await db.collection("users").findOne(
              { _id: message.sender },
              { projection: { name: 1 } }
            );

            // Send the message to the client
            const data = JSON.stringify({
              ...message,
              senderName: sender?.name || message.senderName || "Unknown User",
            });
            controller.enqueue(`data: ${data}\n\n`);
          }
        });

        // Handle errors
        changeStream.on("error", (error: Error) => {
          console.error("Change stream error:", error);
          controller.close();
        });

        // Clean up on close
        req.signal.addEventListener("abort", () => {
          changeStream.close();
          controller.close();
        });
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error("Error in message stream:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 