import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { getSessionMessages, sendMessage } from "../controllers/message.controller.js"

const router = express.Router()

router.post("/", isAuth, sendMessage)
router.get("/:sessionId", isAuth, getSessionMessages)

export default router