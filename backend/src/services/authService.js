import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "./tokenService.js";

/**
 * When a refresh token is used, the old one stays valid for this many seconds.
 * That covers two browser tabs (or a retried request) refreshing at the same
 * moment, which would otherwise log one of them out.
 */
const REFRESH_GRACE_SECONDS = 30;

// Compared against when the email is unknown, so "no such user" and "wrong
// password" take the same time and can't be told apart by timing.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", env.BCRYPT_ROUNDS);

/** Creates the token pair and stores the refresh token (hashed). */
const issueSession = async (user) => {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, expiresAt } = signRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return { user, accessToken, refreshToken, refreshExpiresAt: expiresAt };
};

export const register = async ({ name, email, password }) => {
  let user;
  try {
    // Role is NOT taken from the request: self-registration always creates a "user".
    user = await User.create({ name, email, password });
  } catch (error) {
    // 11000 = the unique index on email was violated. Relying on the index (instead of
    // "find, then create") stays correct even when two sign-ups arrive at the same time.
    if (error.code === 11000) throw ApiError.conflict("Email already in use");
    throw error;
  }
  return issueSession(user);
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  // Checked only AFTER the password is correct, so the message can't be used
  // to discover which emails are registered.
  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated");
  }

  return issueSession(user);
};

/** Exchanges a valid refresh token for a brand-new access + refresh token (rotation). */
export const refresh = async (rawToken) => {
  if (!rawToken) throw ApiError.unauthorized("No refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(rawToken),
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw ApiError.unauthorized("Session expired or revoked");

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("User not found or inactive");

  // Rotate: shorten the old token's life to the grace period, then issue a new one.
  const graceEnd = new Date(Date.now() + REFRESH_GRACE_SECONDS * 1000);
  if (stored.expiresAt > graceEnd) {
    stored.expiresAt = graceEnd;
    await stored.save();
  }

  return issueSession(user);
};

/** Revokes the session behind this refresh token. Safe to call with nothing. */
export const logout = async (rawToken) => {
  if (!rawToken) return;
  await RefreshToken.deleteOne({ tokenHash: hashToken(rawToken) });
};

/** Revokes every session of a user (used when deactivating or deleting them). */
export const revokeAllSessions = (userId) => RefreshToken.deleteMany({ user: userId });
