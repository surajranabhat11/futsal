import mongoose from "mongoose";

const teamChallengeSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchDetails: {
      date: Date,
      time: String,
      location: String,
      teamSize: Number,
      skillLevel: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "I challenge your team to a match!",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const TeamChallenge =
  mongoose.models.TeamChallenge ||
  mongoose.model("TeamChallenge", teamChallengeSchema);

export default TeamChallenge; 