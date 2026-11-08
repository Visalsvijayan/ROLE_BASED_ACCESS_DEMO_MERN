import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/** Runs when no route matched the request. */
export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Turns ANY error into a clean { statusCode, message, details } triple.
 * Known errors become helpful 4xx answers; everything else is a 500.
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message, details: err.details };
  }

  // express.json() problems
  if (err.type === "entity.parse.failed") {
    return { statusCode: 400, message: "Malformed JSON in request body" };
  }
  if (err.type === "entity.too.large") {
    return { statusCode: 413, message: "Request body is too large" };
  }

  // Mongoose: schema validation failed (e.g. price < 0)
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    return { statusCode: 400, message: details[0]?.message ?? "Validation failed", details };
  }

  // Mongoose: malformed value, e.g. an id that isn't an ObjectId
  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: `Invalid ${err.path}` };
  }

  // MongoDB: unique index violated (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? err.keyValue ?? {})[0] ?? "value";
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    return { statusCode: 409, message: `${label} already in use` };
  }

  // Anything else is a bug or an outage. Never leak internals in production.
  return {
    statusCode: 500,
    message: env.isProduction ? "Internal server error" : err.message || "Internal server error",
  };
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const { statusCode, message, details } = normalizeError(err);

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    message,
    ...(details && { errors: details }),
    ...(env.isDevelopment && statusCode >= 500 && { stack: err.stack }),
  });
};
