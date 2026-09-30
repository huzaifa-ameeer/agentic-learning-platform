import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { validateBodyObjectId, validateObjectId } from "../middlewares/validate.middleware.js"
import { completeSession, createSession, deleteSession, getMySessions, getSession, renameSession } from "../controllers/session.controller.js"

const router = express.Router()

router.post("/create", isAuth, validateBodyObjectId("agentId"), createSession)
router.get("/get-all", isAuth, getMySessions)
router.get("/get-single/:id", isAuth, validateObjectId, getSession)
router.patch("/complete/:id", isAuth, validateObjectId, completeSession)
router.patch("/rename/:id", isAuth, validateObjectId, renameSession)
router.delete("/delete/:id", isAuth, validateObjectId, deleteSession)

export default router