import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import connectDb from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js"
import agentRoutes from "./src/routes/agent.route.js"
import sessionRoutes from "./src/routes/session.route.js"

dotenv.config();

const app = express();

app.use(express.json())
app.use(cookieParser());

app.get("/", (req, res)=> {
    res.send("Agentic Learning API is running")
})

app.use("/api/auth", authRoutes)
app.use("/api/agent", agentRoutes)
app.use("/api/session", sessionRoutes)

const port = process.env.PORT || 3001;

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
};

startServer();
