import mongoose from "mongoose";
import agentModel from "../models/agent.model.js";
import learningSessionModel from "../models/learningSession.model.js";

export const createSession = async (req, res) => {
  try {
    const { agentId, title } = req.body;
    if (!agentId) {
      return res.status(400).json({
        message: "agentId is required",
        success: false,
      });
    }
    const agent = await agentModel.findOne({
      _id: agentId,
      isActive: true,
    });
    if (!agent) {
      return res.status(404).json({
        message: "agent not found",
        success: false,
      });
    }
    const session = await learningSessionModel.create({
      user: req.userId,
      agent: agentId,
      title: title || "New Learning Session",
    });
    return res.status(201).json({
      message: "session created successfully",
      success: true,
      session,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in create session API",
      success: false,
    });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const filter = { user: req.userId };

    if (req.query.agent && mongoose.isValidObjectId(req.query.agent)) {
      filter.agent = req.query.agent;
    }

    const sessions = await learningSessionModel
      .find(filter)
      .populate("agent", "name slug description")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSessions = await learningSessionModel.countDocuments(filter);

    const totalPages = Math.ceil(totalSessions / limit);

    return res.status(200).json({
      success: true,
      sessions,
      pagination: {
        currentPage: page,
        limit,
        totalSessions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching sessions",
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await learningSessionModel.findOne({
      _id: id,
      user: req.userId,
    }).populate("agent", "name slug description");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      message: "session found successfully",
      success: true,
      session,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching session",
    });
  }
};

export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await learningSessionModel.findOne({
      _id: id,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Session is already completed",
      });
    }

    session.status = "completed";

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Session completed successfully",
      session: await session.populate("agent", "name slug description"),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error completing session",
    });
  }
};

export const renameSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Session title is required",
      });
    }

    const session = await learningSessionModel.findOne({
      _id: id,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.title = title.trim();

    await session.save();

    const populated = await session.populate("agent", "name slug description");

    return res.status(200).json({
      success: true,
      message: "Session renamed successfully",
      session: populated,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error renaming session",
    });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await learningSessionModel.findOne({
      _id: id,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    await learningSessionModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error deleting session",
    });
  }
};