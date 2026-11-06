import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth",
};

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * POST /api/auth/register
 * Public. Creates a normal "user" account.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json({
      user: sanitize(user),
      accessToken,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Public. One common login for both user and admin.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    const matches = await user.comparePassword(password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({
      user: sanitize(user),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Public. Reads the HTTP-only refresh cookie, validates it, returns a new
 * access token (and rotates the refresh token cookie).
 */
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.json({
      user: sanitize(user),
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Authenticated. Clears the refresh cookie and the access token in memory.
 */
export const logout = (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/api/auth",
  });
  return res.json({ message: "Logged out" });
};

/**
 * GET /api/auth/me
 * Authenticated. Returns the current user.
 */
export const me = async (req, res, next) => {
  try {
    return res.json({ user: sanitize(req.user) });
  } catch (error) {
    next(error);
  }
};
