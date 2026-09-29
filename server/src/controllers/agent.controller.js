import agentModel from "../models/agent.model.js";

export const createAgent = async (req, res) => {
  try {
    const { name, slug, description, systemPrompt } = req.body;
    if (!name || !slug || !description || !systemPrompt) {
      return res.status(400).json({
        message: "missing details",
        success: false,
      });
    }
    const existingSlug = await agentModel.findOne({ slug });
    if (existingSlug) {
      return res.status(409).json({
        message: "agent with this slug already exists",
        success: false,
      });
    }
    const agent = await agentModel.create({
      name,
      slug,
      description,
      systemPrompt,
    });
    return res.status(201).json({
      message: "agent created successfully",
      success: true,
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
    const agents = await agentModel.find({ isActive: true }).sort({
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

    const agent = await agentModel.findById(id);

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

    if (slug && slug !== agent.slug) {
      const existingAgent = await agentModel.findOne({ slug });

      if (existingAgent) {
        return res.status(409).json({
          success: false,
          message: "Agent with this slug already exists",
        });
      }
    }

    agent.name = name ?? agent.name;
    agent.slug = slug ?? agent.slug;
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

    await agentModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error deleting agent",
    });
  }
};