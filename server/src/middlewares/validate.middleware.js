import mongoose from "mongoose";

const OBJECT_ID_PARAMS = ["id", "sessionId"];

export const validateObjectId = (req, res, next) => {
  for (const param of OBJECT_ID_PARAMS) {
    const value = req.params[param];

    if (value !== undefined && !mongoose.isObjectIdOrHexString(value)) {
      return res.status(400).json({
        success: false,
        message: `invalid ${param}`,
      });
    }
  }

  next();
};

export const validateBodyObjectId = (field) => (req, res, next) => {
  const value = req.body?.[field];

  if (value !== undefined && !mongoose.isObjectIdOrHexString(value)) {
    return res.status(400).json({
      success: false,
      message: `invalid ${field}`,
    });
  }

  next();
};