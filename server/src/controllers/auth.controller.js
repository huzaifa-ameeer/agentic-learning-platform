import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { clearCookieOptions, cookieOptions } from "../config/cookie.js"

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();

const isAdminEmail = (email) =>
  ADMIN_EMAIL.length > 0 && String(email || "").toLowerCase() === ADMIN_EMAIL;

const issueToken = (res, user) => {
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("token", token, cookieOptions);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "missing details",
        success: false,
      });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: isAdminEmail(email) ? "admin" : "user",
    });

    return res.status(201).json({
      message: "user registered successfully",
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in register API",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "missing details",
        success: false,
      });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).json({
        message: "invalid password",
        success: false,
      });
    }

    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: issueToken(res, user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in login API",
      success: false,
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "missing details",
        success: false,
      });
    }

    if (!isAdminEmail(email)) {
      return res.status(403).json({
        message: "this account cannot access the admin panel",
        success: false,
      });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "admin account not found, register it first",
        success: false,
      });
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).json({
        message: "invalid password",
        success: false,
      });
    }

    if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: issueToken(res, user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in admin login API",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", clearCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const getMe = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting user",
    });
  }
};