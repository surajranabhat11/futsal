// This script is used to seed the database with initial data for development
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcrypt")

// MongoDB connection string - use a .env file in production
const uri = process.env.MONGODB_URI || "mongodb+srv://futsal_matcher:9812318055@cluster0.fcnng86.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const dbName = "futsal_matcher"

async function seed() {
  let client

  try {
    client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("matches").deleteMany({})
    await db.collection("chats").deleteMany({})
    await db.collection("messages").deleteMany({})
    await db.collection("feedback").deleteMany({})
    await db.collection("notifications").deleteMany({})
    await db.collection("venues").deleteMany({})

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10)

    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        location: "Kathmandu, Nepal",
        bio: "Passionate futsal player with 5 years of experience.",
        position: "Forward",
        skillLevel: "Intermediate",
        availability: ["Weekday Evenings", "Weekend Mornings"],
        notifications: {
          email: true,
          app: true,
          matches: true,
          messages: true,
        },
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        location: "Lalitpur, Nepal",
        bio: "Futsal enthusiast looking for competitive matches.",
        position: "Midfielder",
        skillLevel: "Advanced",
        availability: ["Weekend Afternoons", "Weekend Evenings"],
        notifications: {
          email: true,
          app: true,
          matches: true,
          messages: true,
        },
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        location: "Bhaktapur, Nepal",
        bio: "New to futsal but eager to learn and improve.",
        position: "Defender",
        skillLevel: "Beginner",
        availability: ["Weekday Mornings", "Weekend Mornings"],
        notifications: {
          email: false,
          app: true,
          matches: true,
          messages: true,
        },
      },
    ]

    const userResults = await db.collection("users").insertMany(users)
    console.log(`${userResults.insertedCount} users inserted`)

    const userIds = Object.values(userResults.insertedIds)

    // Create venues
    const venues = [
      {
        name: "Futsal Arena",
        address: "Thamel, Kathmandu",
        location: {
          type: "Point",
          coordinates: [85.3157, 27.7172], // [longitude, latitude]
        },
        rating: 4.7,
        price: "Rs. 1500/hour",
        facilities: ["Covered Court", "Changing Rooms", "Parking"],
        availability: true,
        availableSlots: [
          {
            date: "2024-12-15",
            slots: [
              { time: "09:00", isBooked: false },
              { time: "10:00", isBooked: true },
              { time: "11:00", isBooked: false },
              { time: "12:00", isBooked: false },
              { time: "13:00", isBooked: true },
              { time: "14:00", isBooked: false },
              { time: "15:00", isBooked: false },
              { time: "16:00", isBooked: false },
              { time: "17:00", isBooked: true },
              { time: "18:00", isBooked: true },
              { time: "19:00", isBooked: false },
              { time: "20:00", isBooked: false },
            ],
          },
        ],
        createdAt: new Date(),
      },
      {
        name: "Sports Complex",
        address: "Lalitpur",
        location: {
          type: "Point",
          coordinates: [85.3241, 27.6588], // [longitude, latitude]
        },
        rating: 4.5,
        price: "Rs. 1800/hour",
        facilities: ["Covered Court", "Changing Rooms", "Cafeteria", "Parking"],
        availability: true,
        availableSlots: [
          {
            date: "2024-12-15",
            slots: [
              { time: "09:00", isBooked: true },
              { time: "10:00", isBooked: false },
              { time: "11:00", isBooked: false },
              { time: "12:00", isBooked: true },
              { time: "13:00", isBooked: false },
              { time: "14:00", isBooked: false },
              { time: "15:00", isBooked: true },
              { time: "16:00", isBooked: false },
              { time: "17:00", isBooked: false },
              { time: "18:00", isBooked: true },
              { time: "19:00", isBooked: true },
              { time: "20:00", isBooked: false },
            ],
          },
        ],
        createdAt: new Date(),
      },
      {
        name: "Goal Zone Futsal",
        address: "Bhaktapur",
        location: {
          type: "Point",
          coordinates: [85.4284, 27.6714], // [longitude, latitude]
        },
        rating: 4.3,
        price: "Rs. 1400/hour",
        facilities: ["Covered Court", "Changing Rooms"],
        availability: false,
        availableSlots: [
          {
            date: "2024-12-15",
            slots: [
              { time: "09:00", isBooked: true },
              { time: "10:00", isBooked: true },
              { time: "11:00", isBooked: true },
              { time: "12:00", isBooked: true },
              { time: "13:00", isBooked: true },
              { time: "14:00", isBooked: true },
              { time: "15:00", isBooked: true },
              { time: "16:00", isBooked: true },
              { time: "17:00", isBooked: true },
              { time: "18:00", isBooked: true },
              { time: "19:00", isBooked: true },
              { time: "20:00", isBooked: true },
            ],
          },
        ],
        createdAt: new Date(),
      },
    ]

    const venueResults = await db.collection("venues").insertMany(venues)
    console.log(`${venueResults.insertedCount} venues inserted`)

    // Create matches
    const matches = [
      {
        creatorId: userIds[0].toString(),
        opponentId: userIds[1].toString(),
        location: "Futsal Arena, Kathmandu",
        date: "2024-12-15",
        time: "18:00",
        teamSize: 5,
        status: "accepted",
        createdAt: new Date(),
      },
      {
        creatorId: userIds[0].toString(),
        opponentId: userIds[2].toString(),
        location: "Sports Complex, Lalitpur",
        date: "2024-12-20",
        time: "19:30",
        teamSize: 5,
        status: "pending",
        createdAt: new Date(),
      },
      {
        creatorId: userIds[1].toString(),
        opponentId: userIds[2].toString(),
        location: "Goal Zone Futsal, Bhaktapur",
        date: "2024-12-25",
        time: "17:00",
        teamSize: 5,
        status: "rejected",
        createdAt: new Date(),
      },
    ]

    const matchResults = await db.collection("matches").insertMany(matches)
    console.log(`${matchResults.insertedCount} matches inserted`)

    // Create chats
    const chats = [
      {
        participants: [userIds[0].toString(), userIds[1].toString()],
        createdAt: new Date(),
        lastMessageAt: new Date(),
        lastMessage: "Looking forward to our match!",
        lastMessageSenderId: userIds[0].toString(),
        createdBy: userIds[0].toString(),
        isGroupChat: false,
      },
      {
        participants: [userIds[0].toString(), userIds[2].toString()],
        createdAt: new Date(),
        lastMessageAt: new Date(),
        lastMessage: "Can we reschedule our match?",
        lastMessageSenderId: userIds[2].toString(),
        createdBy: userIds[0].toString(),
        isGroupChat: false,
      },
      {
        participants: [userIds[0].toString(), userIds[1].toString(), userIds[2].toString()],
        createdAt: new Date(),
        lastMessageAt: new Date(),
        lastMessage: "Let's organize a tournament!",
        lastMessageSenderId: userIds[0].toString(),
        createdBy: userIds[0].toString(),
        isGroupChat: true,
        name: "Futsal Tournament Group",
      },
    ]

    const chatResults = await db.collection("chats").insertMany(chats)
    console.log(`${chatResults.insertedCount} chats inserted`)

    const chatIds = Object.values(chatResults.insertedIds)

    // Create messages
    const messages = [
      {
        chatId: chatIds[0].toString(),
        senderId: userIds[0].toString(),
        senderName: "John Doe",
        content: "Hi Jane, are you ready for our match tomorrow?",
        readBy: [userIds[0].toString()],
        createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      },
      {
        chatId: chatIds[0].toString(),
        senderId: userIds[1].toString(),
        senderName: "Jane Smith",
        content: "Yes, I'm looking forward to it!",
        readBy: [userIds[0].toString(), userIds[1].toString()],
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        chatId: chatIds[0].toString(),
        senderId: userIds[0].toString(),
        senderName: "John Doe",
        content: "Great! Looking forward to our match!",
        readBy: [userIds[0].toString()],
        createdAt: new Date(),
      },
      {
        chatId: chatIds[1].toString(),
        senderId: userIds[2].toString(),
        senderName: "Bob Johnson",
        content: "Hi John, can we reschedule our match?",
        readBy: [userIds[2].toString()],
        createdAt: new Date(),
      },
      {
        chatId: chatIds[2].toString(),
        senderId: userIds[0].toString(),
        senderName: "John Doe",
        content: "Hey everyone, let's organize a tournament!",
        readBy: [userIds[0].toString()],
        createdAt: new Date(),
      },
    ]

    const messageResults = await db.collection("messages").insertMany(messages)
    console.log(`${messageResults.insertedCount} messages inserted`)

    // Create feedback
    const feedback = [
      {
        matchId: matchResults.insertedIds[0].toString(),
        senderId: userIds[0].toString(),
        recipientId: userIds[1].toString(),
        rating: 5,
        comment: "Great team to play against. Very fair and skilled players.",
        createdAt: new Date(),
      },
      {
        matchId: matchResults.insertedIds[0].toString(),
        senderId: userIds[1].toString(),
        recipientId: userIds[0].toString(),
        rating: 4,
        comment: "Good match, enjoyed playing with you.",
        createdAt: new Date(),
      },
    ]

    const feedbackResults = await db.collection("feedback").insertMany(feedback)
    console.log(`${feedbackResults.insertedCount} feedback entries inserted`)

    // Create notifications
    const notifications = [
      {
        recipientId: userIds[1].toString(),
        senderId: userIds[0].toString(),
        senderName: "John Doe",
        type: "match_request",
        matchId: matchResults.insertedIds[0].toString(),
        content: "John Doe has invited you to a match",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        read: true,
        readAt: new Date(),
      },
      {
        recipientId: userIds[0].toString(),
        senderId: userIds[1].toString(),
        senderName: "Jane Smith",
        type: "match_update",
        matchId: matchResults.insertedIds[0].toString(),
        content: "Jane Smith has accepted your match request",
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
        read: true,
        readAt: new Date(),
      },
      {
        recipientId: userIds[0].toString(),
        senderId: userIds[2].toString(),
        senderName: "Bob Johnson",
        type: "message",
        chatId: chatIds[1].toString(),
        messageId: messageResults.insertedIds[3].toString(),
        content: "Bob Johnson sent you a message",
        createdAt: new Date(),
        read: false,
      },
      {
        recipientId: userIds[1].toString(),
        senderId: userIds[0].toString(),
        senderName: "John Doe",
        type: "message",
        chatId: chatIds[2].toString(),
        messageId: messageResults.insertedIds[4].toString(),
        isGroupChat: true,
        chatName: "Futsal Tournament Group",
        content: "John Doe sent a message to Futsal Tournament Group",
        createdAt: new Date(),
        read: false,
      },
    ]

    const notificationResults = await db.collection("notifications").insertMany(notifications)
    console.log(`${notificationResults.insertedCount} notifications inserted`)

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("MongoDB connection closed")
    }
  }
}

// Run the seed function
seed().catch(console.error)
