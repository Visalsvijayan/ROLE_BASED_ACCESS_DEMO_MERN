import { env } from "../config/env.js";

/**
 * A tiny logger. It is one file on purpose: when you outgrow it, swap the
 * body for pino or winston and nothing else in the project has to change.
 */
const write = (level, args) => {
  if (env.isTest) return; // keep test output clean
  const method = level === "info" ? "log" : level;
  console[method](`[${new Date().toISOString()}] ${level.toUpperCase()}`, ...args);
};

export const logger = {
  info: (...args) => write("info", args),
  warn: (...args) => write("warn", args),
  error: (...args) => write("error", args),
};
