import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "slug is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },
  systemPrompt: {
    type: String,
    required: [true, "system prompt is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String,
    default: "code",
  },
  iconAccent: {
    type: String,
    default: "blue",
  },
  iconSource: {
    type: String,
    enum: ["ai", "fallback"],
    default: "fallback",
  },
}, { timestamps: true });

const agentModel = mongoose.model("Agent", agentSchema);

export default agentModel;
