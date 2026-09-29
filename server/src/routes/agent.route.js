import express from "express";
import { createAgent, getAgent, getAgents, updateAgent } from "../controllers/agent.controller.js";
import { isAdmin } from "../middlewares/admin.middlerware.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", isAuth, isAdmin, createAgent);
router.get("/get-all", isAuth, getAgents)
router.get("/get-single/:id", isAuth, getAgent)
router.put("/update/:id", isAuth, isAdmin, updateAgent)

export default router;
