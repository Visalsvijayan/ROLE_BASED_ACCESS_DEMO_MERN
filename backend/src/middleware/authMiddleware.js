import User from "../models/User.js";
import { verifyAccessToken } from "../services/tokenService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * protect  (authentication: "who are you?")
 *
 * Reads `Authorization: Bearer <token>`, verifies it and attaches the current
 * user to req.user. The user is loaded from the database on every request, so
 * a deactivated or deleted user is locked out immediately, not when their
 * token happens to expire.
 *
 * Always answers 401 when the caller can't be identified.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Not authenticated");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (!user.isActive) throw ApiError.unauthorized("Account is deactivated");

  req.user = user;
  next();
});
