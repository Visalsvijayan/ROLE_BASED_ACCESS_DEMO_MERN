import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

mongoose.set("strictQuery", true);

export const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI, {
    // Fail within 10s (instead of hanging forever) if MongoDB is unreachable.
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info(`MongoDB connected: ${mongoose.connection.host}`);
};

export const disconnectDB = () => mongoose.disconnect();
