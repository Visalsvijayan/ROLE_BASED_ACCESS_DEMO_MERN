import { env } from "../config/env.js";
import * as authService from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const REFRESH_COOKIE = "refreshToken";

/**
 * The refresh token lives in an HTTP-only cookie: JavaScript in the browser
 * can never read it, so an XSS bug cannot steal it. `path` limits it to the
 * auth endpoints, so it isn't sent along with every API request.
 */
const baseCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.COOKIE_SAME_SITE,
  path: "/api/auth",
};

const sendSession = (res, statusCode, session) => {
  res.cookie(REFRESH_COOKIE, session.refreshToken, {
    ...baseCookieOptions,
    expires: session.refreshExpiresAt,
  });
  res.status(statusCode).json({ user: session.user, accessToken: session.accessToken });
};

/** POST /api/auth/register - public. Always creates a "user" account. */
export const register = asyncHandler(async (req, res) => {
  sendSession(res, 201, await authService.register(req.body));
});

/** POST /api/auth/login - public. One login for both user and admin. */
export const login = asyncHandler(async (req, res) => {
  sendSession(res, 200, await authService.login(req.body));
});

/** POST /api/auth/refresh - public, but needs the refresh cookie. */
export const refresh = asyncHandler(async (req, res) => {
  sendSession(res, 200, await authService.refresh(req.cookies?.[REFRESH_COOKIE]));
});

/** POST /api/auth/logout - public and idempotent: always clears the cookie. */
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
  res.json({ message: "Logged out" });
});

/** GET /api/auth/me - authenticated. */
export const me = (req, res) => {
  res.json({ user: req.user });
};
