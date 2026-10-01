import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./src/config/db.js";
import corsOptions from "./src/config/cors.js";
import authRoutes from "./src/routes/auth.route.js"
import agentRoutes from "./src/routes/agent.route.js"
import sessionRoutes from "./src/routes/session.route.js"
import messageRoutes from "./src/routes/message.route.js"


const app = express();

// Render terminates TLS and forwards the request, so trust the proxy
app.set("trust proxy", 1);

app.use(express.json())
app.use(cookieParser());
app.use(cors(corsOptions));

app.get("/", (req, res)=> {
    res.send("Agentic Learning API is running")
})

app.use("/api/auth", authRoutes)
app.use("/api/agent", agentRoutes)
app.use("/api/session", sessionRoutes)
app.use("/api/message", messageRoutes)

const port = process.env.PORT || 3001;

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
};

startServer();
