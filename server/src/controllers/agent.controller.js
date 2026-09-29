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
