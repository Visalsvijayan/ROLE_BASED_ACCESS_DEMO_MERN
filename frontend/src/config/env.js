/**
 * Every environment-dependent value in the app lives here.
 * Other files import from this module instead of reading import.meta.env.
 *
 * Remember: anything starting with VITE_ is PUBLIC (compiled into the bundle).
 */
export const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const IS_DEV = import.meta.env.DEV;
