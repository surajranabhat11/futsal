import mongoose, { Schema, Document, Types } from 'mongoose';
import './Message'; // Import Message model to ensure it's registered first

export interface IChat extends Document {
  participants: Types.ObjectId[];
  name?: string; // Name of the chat (e.g., group name or custom name)
  lastMessage?: Types.ObjectId; // Reference to the last message in the chat
  lastMessageAt?: Date; // Timestamp of the last message for sorting
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    name: {
      type: String,
      trim: true, // Removes extra spaces
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      index: true, // Index for sorting chats by recent activity
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding chats involving specific users
ChatSchema.index({ participants: 1 });

// Register the model if it hasn't been registered yet
if (!mongoose.models.Chat) {
  mongoose.model<IChat>('Chat', ChatSchema);
}

export default mongoose.models.Chat;