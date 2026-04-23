import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  senderName: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  readBy: Types.ObjectId[]; // Keep track of who has read the message
  reactions?: Record<string, string[]>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true, // Index for fetching messages for a chat
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileName: {
      type: String,
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    reactions: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Register the model if it hasn't been registered yet
if (!mongoose.models.Message) {
  mongoose.model<IMessage>('Message', MessageSchema);
}

export default mongoose.models.Message; 