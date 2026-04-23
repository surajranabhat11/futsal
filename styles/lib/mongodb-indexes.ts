import clientPromise from "./mongodb"

/**
 * Set up MongoDB indexes for optimal query performance
 */
export async function setupMongoDBIndexes() {
  try {
    const client = await clientPromise
    const db = client.db("futsal_matcher")

    // Users collection indexes
    await db.collection("users").createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { location: "2dsphere" }, sparse: true }, // For geo queries
    ])

    // Chats collection indexes
    await db.collection("chats").createIndexes([{ key: { participants: 1 } }, { key: { lastMessageAt: -1 } }])

    // Messages collection indexes
    await db.collection("messages").createIndexes([{ key: { chatId: 1, createdAt: 1 } }, { key: { senderId: 1 } }])

    // Matches collection indexes
    await db
      .collection("matches")
      .createIndexes([
        { key: { creatorId: 1 } },
        { key: { opponentId: 1 } },
        { key: { status: 1 } },
        { key: { date: 1 } },
      ])

    // Feedback collection indexes
    await db
      .collection("feedback")
      .createIndexes([{ key: { recipientId: 1 } }, { key: { senderId: 1 } }, { key: { matchId: 1 } }])

    // Notifications collection indexes
    await db
      .collection("notifications")
      .createIndexes([{ key: { recipientId: 1, read: 1 } }, { key: { createdAt: -1 } }])

    console.log("MongoDB indexes set up successfully")
  } catch (error) {
    console.error("Error setting up MongoDB indexes:", error)
  }
}
