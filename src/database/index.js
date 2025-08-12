import mongoose from "mongoose";
import { Config } from "../config/index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(Config.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
