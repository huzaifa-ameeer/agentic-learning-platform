import dotenv from "dotenv";
import express from "express";
import connectDb from "./src/config/db.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 3001;

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
};

startServer();
