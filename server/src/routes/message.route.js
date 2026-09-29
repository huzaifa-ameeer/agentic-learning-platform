import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { sendMessage } from "../controllers/message.controller.js"

const router = express.Router()

router.post("/", isAuth, sendMessage)

export default router