import clientPromise from "./mongodb"

export async function initializeDatabase() {
  try {
    const client = await clientPromise
    const db = client.db("futsal_matcher")

    // Create indexes for users collection
    await db.collection("users").createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { location: "2dsphere" }, sparse: true },
    ])

    // Create indexes for matches collection
    await db
      .collection("matches")
      .createIndexes([
        { key: { creatorId: 1 } },
        { key: { opponentId: 1 } },
        { key: { status: 1 } },
        { key: { date: 1 } },
      ])

    // Create indexes for chats collection
    await db.collection("chats").createIndexes([{ key: { participants: 1 } }, { key: { lastMessageAt: -1 } }])

    // Create indexes for messages collection
    await db.collection("messages").createIndexes([{ key: { chatId: 1, createdAt: 1 } }, { key: { senderId: 1 } }])

    // Create indexes for feedback collection
    await db
      .collection("feedback")
      .createIndexes([{ key: { recipientId: 1 } }, { key: { senderId: 1 } }, { key: { matchId: 1 } }])

    // Create indexes for notifications collection
    await db
      .collection("notifications")
      .createIndexes([{ key: { recipientId: 1, read: 1 } }, { key: { createdAt: -1 } }])

    // Create indexes for venues collection
    await db.collection("venues").createIndexes([{ key: { location: "2dsphere" } }, { key: { name: "text" } }])

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}
