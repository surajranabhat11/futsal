import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlayerInvitation extends Document {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const playerInvitationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "Would you like to join my team?",
    },
  },
  { timestamps: true }
);

// Add compound index for faster queries
playerInvitationSchema.index({ sender: 1, recipient: 1 });
playerInvitationSchema.index({ status: 1, createdAt: -1 });

const PlayerInvitation =
  mongoose.models.PlayerInvitation ||
  mongoose.model<IPlayerInvitation>("PlayerInvitation", playerInvitationSchema);

export default PlayerInvitation; 