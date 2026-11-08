import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const createLimiter = (options) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    standardHeaders: "draft-7", // sends RateLimit-* headers so clients can back off
    legacyHeaders: false,
    skip: () => env.isTest,
    handler: (_req, _res, next) =>
      next(new ApiError(429, "Too many requests. Please try again in a few minutes.")),
    ...options,
  });

/** Safety net for the whole API: 300 requests per 15 minutes per IP. */
export const apiLimiter = createLimiter({ limit: 300 });

/**
 * Brute-force protection for login and register: 20 FAILED attempts per
 * 15 minutes per IP. Successful requests don't count, so normal users are
 * never blocked.
 */
export const authLimiter = createLimiter({ limit: 20, skipSuccessfulRequests: true });
