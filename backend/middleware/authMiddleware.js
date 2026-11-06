import User from "../models/User.js";
import { verifyAccessToken } from "../utils/tokenUtils.js";

/**
 * protect
 * Verifies the JWT access token from the Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 *
 * 401 if token is missing/invalid/expired or the user no longer exists
 * or has been deactivated.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
