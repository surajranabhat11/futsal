import mongoose, { Schema, Document, Types } from 'mongoose'

export interface INotification extends Document {
  recipient: Types.ObjectId
  sender?: Types.ObjectId
  senderName?: string
  type: 'match_invite' | 'match_update' | 'new_message' | 'friend_request' | 'system' | 'player_invite' | 'feedback' | 'invitation_accepted' | 'invitation_rejected' | 'challenge_accepted' | 'challenge_rejected' | 'booking_update' | 'broadcast'
  content: string
  link?: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    senderName: {
      type: String,
    },
    type: {
      type: String,
      enum: ['match_invite', 'match_update', 'new_message', 'friend_request', 'system', 'player_invite', 'feedback', 'invitation_accepted', 'invitation_rejected', 'challenge_accepted', 'challenge_rejected', 'booking_update', 'broadcast'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

NotificationSchema.index({ recipient: 1, read: 1 })

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)