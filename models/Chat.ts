import mongoose, { Schema, Document, Types } from 'mongoose';
import './Message';

export interface IChat extends Document {
  participants: Types.ObjectId[];
  name?: string;
  isGroupChat: boolean;
  createdBy?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
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
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ChatSchema.index({ participants: 1 });

if (!mongoose.models.Chat) {
  mongoose.model<IChat>('Chat', ChatSchema);
}

export default mongoose.models.Chat;