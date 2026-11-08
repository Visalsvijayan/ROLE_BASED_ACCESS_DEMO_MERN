import { ApiError } from "../utils/ApiError.js";

/**
 * authorize(...allowedRoles)  (authorization: "are you allowed to do this?")
 *
 *   router.get("/", protect, authorize(ROLES.ADMIN), listUsers);
 *
 * Must run AFTER `protect` so req.user exists.
 *   401 -> we don't know who you are
 *   403 -> we know who you are, and your role isn't allowed here
 */
export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized("Not authenticated"));
    if (!allowedRoles.includes(req.user.role)) return next(ApiError.forbidden("Access denied"));
    next();
  };
