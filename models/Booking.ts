import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  venueId: Types.ObjectId;
  userId: Types.ObjectId;
  playerPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'blocked';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'refund_pending';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    playerPhone: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g. "14:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "15:00"
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'blocked'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'refund_pending'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'esewa',
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overlapping bookings for the same venue
BookingSchema.index({ venueId: 1, date: 1, startTime: 1 }, { unique: false }); // Needs complex logic for exact overlap, so standard index for queries

if (mongoose.models.Booking) {
  delete (mongoose.models as any).Booking;
}

export default mongoose.model<IBooking>('Booking', BookingSchema);
