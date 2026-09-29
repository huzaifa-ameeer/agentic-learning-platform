import express from "express";
import { createAgent, getAgent, getAgents } from "../controllers/agent.controller.js";
import { isAdmin } from "../middlewares/admin.middlerware.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", isAuth, isAdmin, createAgent);
router.get("/get-all", isAuth, getAgents)
router.get("/get-single/:id", isAuth, getAgent)

export default router;
