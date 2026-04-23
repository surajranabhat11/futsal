import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  emailVerified?: Date | null;
  image?: string;
  phone?: string;
  location?: string;
  bio?: string;
  position?: string;
  skillLevel?: string;
  role?: "player" | "owner" | "admin";
  availability?: string[];
  notifications?: {
    email: boolean;
    app: boolean;
    matches: boolean;
    messages: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    emailVerified: { type: Date, default: null },
    image: { type: String },
    phone: { type: String },
    location: { type: String },
    bio: { type: String },
    position: { type: String },
    skillLevel: { type: String },
    role: { type: String, enum: ["player", "owner", "admin"], default: "player" },
    availability: { type: [String], default: [] },
    notifications: {
      email: { type: Boolean, default: true },
      app: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
