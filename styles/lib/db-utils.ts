import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import type {
  User,
  Match,
  Chat,
  Message,
  Feedback,
  Notification,
  Venue,
} from "./db-schema";

// Database name
const DB_NAME = "futsal_matcher";

// Collection names
const COLLECTIONS = {
  USERS: "users",
  MATCHES: "matches",
  CHATS: "chats",
  MESSAGES: "messages",
  FEEDBACK: "feedback",
  NOTIFICATIONS: "notifications",
  VENUES: "venues",
};

// Get database instance
export async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// User operations
export async function findUserById(id: string) {
  const db = await getDb();
  return db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  return db.collection(COLLECTIONS.USERS).findOne({ email });
}

export async function createUser(user: Omit<User, "_id">) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.USERS).insertOne(user);
  return { ...user, _id: result.insertedId };
}

export async function updateUser(id: string, update: Partial<User>) {
  const db = await getDb();
  const result = await db
    .collection(COLLECTIONS.USERS)
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  return result.modifiedCount > 0;
}

// Match operations
export async function findMatchById(id: string) {
  try {
    const db = await getDb();

    // Validate ObjectId format before querying
    if (!ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return null;
    }

    return db
      .collection(COLLECTIONS.MATCHES)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error in findMatchById:", error);
    return null;
  }
}

export async function findMatchesByUser(userId: string) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.MATCHES)
    .find({
      $or: [{ creatorId: userId }, { opponentId: userId }],
    })
    .sort({ date: -1 })
    .toArray();
}

export async function createMatch(match: Omit<Match, "_id">) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.MATCHES).insertOne(match);
  return { ...match, _id: result.insertedId };
}

export async function updateMatch(id: string, update: Partial<Match>) {
  const db = await getDb();
  const result = await db
    .collection(COLLECTIONS.MATCHES)
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  return result.modifiedCount > 0;
}

// Chat operations
export async function findChatById(id: string) {
  const db = await getDb();
  return db.collection(COLLECTIONS.CHATS).findOne({ _id: new ObjectId(id) });
}

export async function findChatsByUser(userId: string) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.CHATS)
    .find({
      participants: userId,
    })
    .sort({ lastMessageAt: -1 })
    .toArray();
}

export async function createChat(chat: Omit<Chat, "_id">) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.CHATS).insertOne(chat);
  return { ...chat, _id: result.insertedId };
}

export async function updateChat(id: string, update: Partial<Chat>) {
  const db = await getDb();
  const result = await db
    .collection(COLLECTIONS.CHATS)
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  return result.modifiedCount > 0;
}

// Message operations
export async function findMessagesByChatId(chatId: string) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.MESSAGES)
    .find({ chatId })
    .sort({ createdAt: 1 })
    .toArray();
}

export async function createMessage(message: Omit<Message, "_id">) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.MESSAGES).insertOne(message);
  return { ...message, _id: result.insertedId };
}

// Feedback operations
export async function findFeedbackByRecipient(recipientId: string) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.FEEDBACK)
    .find({ recipientId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function createFeedback(feedback: Omit<Feedback, "_id">) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.FEEDBACK).insertOne(feedback);
  return { ...feedback, _id: result.insertedId };
}

// Notification operations
export async function findNotificationsByUser(
  userId: string,
  limit = 20,
  unreadOnly = false
) {
  const db = await getDb();
  const query: any = { recipientId: userId };
  if (unreadOnly) {
    query.read = false;
  }
  return db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function createNotification(
  notification: Omit<Notification, "_id">
) {
  const db = await getDb();
  const result = await db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .insertOne(notification);
  return { ...notification, _id: result.insertedId };
}

export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
) {
  const db = await getDb();
  if (notificationIds && notificationIds.length > 0) {
    await db.collection(COLLECTIONS.NOTIFICATIONS).updateMany(
      {
        _id: { $in: notificationIds.map((id) => new ObjectId(id)) },
        recipientId: userId,
      },
      { $set: { read: true, readAt: new Date() } }
    );
  } else {
    await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .updateMany(
        { recipientId: userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
  }
  return true;
}

// Venue operations
export async function findVenuesByLocation(
  longitude: number,
  latitude: number,
  maxDistance = 10000
) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.VENUES)
    .find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance, // in meters
        },
      },
    })
    .toArray();
}

export async function findVenuesByName(name: string) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.VENUES)
    .find({
      name: { $regex: name, $options: "i" },
    })
    .toArray();
}

export async function createVenue(venue: Omit<Venue, "_id">) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.VENUES).insertOne(venue);
  return { ...venue, _id: result.insertedId };
}
