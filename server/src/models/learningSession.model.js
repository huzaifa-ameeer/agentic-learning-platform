import mongoose from "mongoose";

const learningSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "session cannot be created without user"],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: [true, "session cann"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
      default: "New Learning Session",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

const learningSessionModel = mongoose.model(
  "LearningSession",
  learningSessionSchema,
);

export default learningSessionModel;
