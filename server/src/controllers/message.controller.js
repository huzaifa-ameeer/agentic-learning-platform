import learningSessionModel from "../models/learningSession.model.js";
import messageModel from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    if (!sessionId || !content) {
      return res.status(400).json({
        message: "sessionId and content are required",
        success: false,
      });
    }
    const session = await learningSessionModel.findOne({
      _id: sessionId,
      user: req.userId,
    });
    if (!session) {
      return res.status(404).json({
        message: "session not found",
        success: false,
      });
    }
    if (session.status === "completed") {
      return res.status(400).json({
        message: "this session is already completed",
        success: false,
      });
    }
    const message = await messageModel.create({
      session: sessionId,
      sender: "user",
      content,
    });

    return res.status(201).json({
      message: "message sent successfully",
      success: true,
      data: message,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in send message API",
      success: false,
    });
  }
};
