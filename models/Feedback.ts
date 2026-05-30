import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IFeedback extends Document {
  from: Types.ObjectId
  to: Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema: Schema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

// One feedback per pair
FeedbackSchema.index({ from: 1, to: 1 }, { unique: true })

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)