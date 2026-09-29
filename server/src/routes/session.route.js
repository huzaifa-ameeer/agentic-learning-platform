import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { completeSession, createSession, getMySessions, getSession } from "../controllers/session.controller.js"

const router = express.Router()

router.post("/create", isAuth, createSession)
router.get("/get-all", isAuth, getMySessions)
router.get("/get-single/:id", isAuth, getSession)
router.patch("/complete/:id", isAuth, completeSession)

export default router