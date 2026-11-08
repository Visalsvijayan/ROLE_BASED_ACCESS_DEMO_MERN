import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import app from "./app.js";
import { logger } from "./utils/logger.js";

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  // Graceful shutdown: stop taking new requests, let running ones finish,
  // close the database, then exit. Hosting platforms send SIGTERM on every deploy.
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref(); // don't hang forever
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

// A crashed process is restarted by the host; a zombie process half-working is worse.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

start().catch((error) => {
  logger.error("Failed to start the server:", error.message);
  process.exit(1);
});
