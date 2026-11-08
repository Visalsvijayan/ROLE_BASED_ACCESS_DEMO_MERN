/**
 * Holds the short-lived ACCESS token in memory only.
 *
 * Why not localStorage? Anything in localStorage can be read by any script on
 * the page, so one XSS bug would leak the token. A plain variable can't be
 * read that way. The cost: a page reload loses it - which is fine, because the
 * app silently gets a new one using the HTTP-only refresh cookie (see AuthProvider).
 */
let accessToken = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
