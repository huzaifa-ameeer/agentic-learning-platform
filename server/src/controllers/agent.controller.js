import agentModel from "../models/agent.model.js";
import learningSessionModel from "../models/learningSession.model.js";
import { generateAgentIcon } from "../services/ai.service.js";
import { fallbackIcon } from "../services/icon.service.js";

const normalizeSlug = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const applyAiIcon = async (id, { name, description }) => {
  try {
    const icon = await generateAgentIcon({ name, description });

    await agentModel.updateOne(
      { _id: id },
      { $set: { icon: icon.glyph, iconAccent: icon.accent, iconSource: icon.source } },
    );
  } catch (error) {
    console.error("background icon generation failed:", error?.message || error);
  }
};

export const createAgent = async (req, res) => {
  try {
    const { name, slug, description, systemPrompt } = req.body;
    if (!name || !description || !systemPrompt) {
      return res.status(400).json({
        message: "missing details",
        success: false,
      });
    }

    // a blank slug is derived from the name rather than rejected
    const cleanSlug = normalizeSlug(slug || name);

    if (!cleanSlug) {
      return res.status(400).json({
        message: "slug needs at least one letter or number",
        success: false,
      });
    }

    const existingSlug = await agentModel.findOne({ slug: cleanSlug });
    if (existingSlug) {
      return res.status(409).json({
        message: "agent with this slug already exists",
        success: false,
      });
    }

    const icon = fallbackIcon();

    const agent = await agentModel.create({
      name,
      slug: cleanSlug,
      description,
      systemPrompt,
      icon: icon.glyph,
      iconAccent: icon.accent,
      iconSource: "fallback",
    });

    // answer immediately, then let the model upgrade the icon in the background
    void applyAiIcon(agent._id, { name, description });

    return res.status(201).json({
      message: "agent created successfully",
      success: true,
      agent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in create agent API",
      success: false,
    });
  }
};


export const getAgents = async (req, res) => {
  try {
    const agents = await agentModel
      .find({ isActive: true })
      .select(req.userRole === "admin" ? "" : "-systemPrompt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching agents",
    });
  }
};

export const getAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await agentModel
      .findById(id)
      .select(req.userRole === "admin" ? "" : "-systemPrompt");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    return res.status(200).json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching agent",
    });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, systemPrompt, isActive } = req.body;

    const agent = await agentModel.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    let cleanSlug;

    if (slug !== undefined) {
      cleanSlug = normalizeSlug(slug);

      if (!cleanSlug) {
        return res.status(400).json({
          success: false,
          message: "Slug needs at least one letter or number",
        });
      }

      if (cleanSlug !== agent.slug) {
        const existingAgent = await agentModel.findOne({ slug: cleanSlug });

        if (existingAgent) {
          return res.status(409).json({
            success: false,
            message: "Agent with this slug already exists",
          });
        }
      }
    }

    agent.name = name ?? agent.name;
    if (cleanSlug) {
      agent.slug = cleanSlug;
    }
    agent.description = description ?? agent.description;
    agent.systemPrompt = systemPrompt ?? agent.systemPrompt;
    agent.isActive = isActive ?? agent.isActive;

    await agent.save();

    return res.status(200).json({
      success: true,
      message: "Agent updated successfully",
      agent,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error updating agent",
    });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await agentModel.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    const removedSessions = await learningSessionModel.deleteMany({ agent: id });

    await agentModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Agent deleted successfully",
      deletedSessions: removedSessions.deletedCount || 0,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error deleting agent",
    });
  }
};
