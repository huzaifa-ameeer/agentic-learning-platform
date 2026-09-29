import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { createSession, getMySessions } from "../controllers/session.controller.js"

const router = express.Router()

router.post("/create", isAuth, createSession)
router.get("/get-all", isAuth, getMySessions)

export default router