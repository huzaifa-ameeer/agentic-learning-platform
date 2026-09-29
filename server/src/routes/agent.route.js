import express from "express";
import { createAgent } from "../controllers/agent.controller.js";
import { isAdmin } from "../middlewares/admin.middlerware.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", isAuth, isAdmin, createAgent);

export default router;
