import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connection succeed");
  } catch (error) {
    console.log("DB connection failed", error);
  }
};

export default connectDb;
