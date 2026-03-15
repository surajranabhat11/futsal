import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    location: String,
    bio: String,
    position: String,
    skillLevel: String,
    availability: Object,
    notifications: {
      type: Boolean,
      default: true,
    },
    profileImage: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Profile ||
  mongoose.model("Profile", ProfileSchema);
