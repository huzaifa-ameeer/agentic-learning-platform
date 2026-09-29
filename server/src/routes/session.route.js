import express from "express"
import { isAuth } from "../middlewares/auth.middleware.js"
import { createSession } from "../controllers/session.controller.js"

const router = express.Router()

router.post("/create", isAuth, createSession)

export default router