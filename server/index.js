import dotenv from "dotenv";
import express from "express";
import connectDb from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js"

dotenv.config();

const app = express();

app.use(express.json())

app.get("/", (req, res)=> {
    res.send("Agentic Learning API is running")
})

app.use("/api/auth", authRoutes)

const port = process.env.PORT || 3001;

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
};

startServer();
