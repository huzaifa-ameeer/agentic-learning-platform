import agentModel from "../models/agent.model.js";
import learningSessionModel from "../models/learningSession.model.js";
import messageModel from "../models/message.model.js";
import { generateAgentResponse } from "../services/ai.service.js";

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

    await messageModel.create({
      session: sessionId,
      sender: "user",
      content,
    });

    const agent = await agentModel.findById(session.agent);
    if (!agent || !agent.isActive) {
      return res.status(404).json({
        message: "agent not found or inactive",
        success: false,
      });
    }

    const messages = await messageModel
      .find({ session: sessionId })
      .sort({ createdAt: 1 });

    const aiResponse = await generateAgentResponse({
      systemPrompt: agent.systemPrompt,
      messages,
    });

    const agentMessage = await messageModel.create({
      session: sessionId,
      sender: "agent",
      content: aiResponse,
    });

    return res.status(201).json({
      message: "message sent successfully",
      success: true,
      data: {
        agent: {
          id: agent._id,
          name: agent.name,
          slug: agent.slug,
        },
        userMessage: content,
        agentMessage,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in send message API",
      success: false,
    });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

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

    const messages = await messageModel
      .find({ session: sessionId })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "messages fetched successfully",
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "error in get session messages API",
      success: false,
    });
  }
};
