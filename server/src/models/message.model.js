import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningSession",
    required: [true, "session is required"],
  },
  sender: {
    type: String,
    enum: ["user", "agent"],
    required: [true, "user or agent are required"],
  },
  content: {
    type: String,
    required: [true, "content is required"],
    trim: true,
  },
}, {timestamps: true});

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
