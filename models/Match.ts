import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["opponents", "teammates"],
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  distance: {
    type: Number,
    required: false,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: false,
  },
  teamSize: {
    type: Number,
    required: true,
  },
  isSkillBased: {
    type: Boolean,
    default: false,
  },
  positionsNeeded: [
    {
      type: String,
      enum: ["any", "Goalkeeper", "Defender", "Midfielder", "Forward"],
    },
  ],
  skillLevel: {
    type: String,
    enum: ["any", "Beginner", "Intermediate", "Advanced", "Professional"],
    default: "any",
  },
  status: {
    type: String,
    enum: ["open", "matched", "completed", "cancelled"],
    default: "open",
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  result: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    score: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

delete mongoose.models.Match;
export default mongoose.model("Match", MatchSchema);
