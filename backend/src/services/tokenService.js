import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ALGORITHM = "HS256";
const SECONDS_PER_DAY = 24 * 60 * 60;

/**
 * Access token: short-lived (15 min by default), sent in the
 * `Authorization: Bearer ...` header. It only carries the user id; the role is
 * always read fresh from the database, so changing a role or deactivating a
 * user takes effect immediately.
 */
export const signAccessToken = (user) =>
  jwt.sign({}, env.JWT_ACCESS_SECRET, {
    algorithm: ALGORITHM,
    subject: String(user._id),
    expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
  });

/**
 * Refresh token: long-lived (7 days by default), kept in an HTTP-only cookie.
 * `jwtid` makes every token unique, even if two are issued in the same second.
 */
export const signRefreshToken = (user) => {
  const expiresInSeconds = env.REFRESH_TOKEN_TTL_DAYS * SECONDS_PER_DAY;
  const token = jwt.sign({}, env.JWT_REFRESH_SECRET, {
    algorithm: ALGORITHM,
    subject: String(user._id),
    jwtid: crypto.randomUUID(),
    expiresIn: expiresInSeconds,
  });
  return { token, expiresAt: new Date(Date.now() + expiresInSeconds * 1000) };
};

// Pinning `algorithms` stops "alg: none" and algorithm-confusion attacks.
export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [ALGORITHM] });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: [ALGORITHM] });

// Refresh tokens are long random strings, so a fast hash is enough (no bcrypt needed).
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
