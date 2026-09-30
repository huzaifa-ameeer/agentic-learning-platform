import express from "express";
import { createAgent, deleteAgent, getAgent, getAgents, updateAgent } from "../controllers/agent.controller.js";
import { isAdmin } from "../middlewares/admin.middlerware.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/create", isAuth, isAdmin, createAgent);
router.get("/get-all", isAuth, getAgents)
router.get("/get-single/:id", isAuth, validateObjectId, getAgent)
router.put("/update/:id", isAuth, validateObjectId, isAdmin, updateAgent)
router.delete("/delete/:id", isAuth, validateObjectId, isAdmin, deleteAgent)

export default router;