import mongoose from "mongoose";

// Define an interface for the cache structure
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Explicitly type `cached` and cast the global assignment
let cached: MongooseCache = global.mongoose as MongooseCache;

if (!cached) {
  // Also cast the assignment back to global if creating it
  cached = global.mongoose = { conn: null, promise: null } as MongooseCache;
}

async function dbConnect(): Promise<typeof mongoose> {
  // Return the mongoose instance
  if (cached.conn) {
    console.log("Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Creating new database connection promise");
    // This assignment should now be compatible
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    console.log("Awaiting database connection promise");
    cached.conn = await cached.promise;
    console.log("Database connection established");
  } catch (e) {
    console.error("Database connection error:", e);
    cached.promise = null;
    throw e;
  }

  // Ensure a connection is returned, throw if null (shouldn't happen if await succeeded)
  if (!cached.conn) {
    throw new Error("Database connection failed after await.");
  }
  return cached.conn;
}

// Adjust the global type definition
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

export default dbConnect;
