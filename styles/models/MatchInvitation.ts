import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMatchInvitation extends Document {
  match: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchInvitationSchema: Schema = new Schema(
  {
    match: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
MatchInvitationSchema.index({ recipient: 1, status: 1 });
MatchInvitationSchema.index({ match: 1, status: 1 });

export default mongoose.models.MatchInvitation || mongoose.model<IMatchInvitation>('MatchInvitation', MatchInvitationSchema); 