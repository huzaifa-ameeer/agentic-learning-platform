import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { validateBodyObjectId, validateObjectId } from "../middlewares/validate.middleware.js"
import { getSessionMessages, sendMessage } from "../controllers/message.controller.js"

const router = express.Router()

router.post("/", isAuth, validateBodyObjectId("sessionId"), sendMessage)
router.get("/:sessionId", isAuth, validateObjectId, getSessionMessages)

export default router