import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

/**
 * Environment variables, validated ONCE at startup.
 *
 * If something is missing or wrong the server refuses to start and tells you
 * exactly what to fix - far better than a confusing crash later on.
 * Everywhere else in the code, import `env` from this file instead of
 * reading `process.env` directly.
 */
const SECRET_HINT =
  "generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(8000),

    MONGO_URI: z.string().min(1, "MONGO_URI is required"),

    JWT_ACCESS_SECRET: z.string().min(32, `must be at least 32 characters (${SECRET_HINT})`),
    JWT_REFRESH_SECRET: z.string().min(32, `must be at least 32 characters (${SECRET_HINT})`),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(1).default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).default(7),

    // Comma-separated list of allowed frontend origins (for CORS).
    CLIENT_URL: z.string().min(1).default("http://localhost:5173"),
    // "lax" works when frontend and API share a site (or use the Vite proxy / a rewrite).
    // Use "none" only when they live on different sites (e.g. vercel.app + onrender.com).
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
    // Number of reverse proxies in front of the API (Render/Heroku/Nginx = 1).
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),

    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  })
  .refine((v) => v.JWT_ACCESS_SECRET !== v.JWT_REFRESH_SECRET, {
    path: ["JWT_REFRESH_SECRET"],
    message: "must be different from JWT_ACCESS_SECRET",
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("\nInvalid environment configuration:\n");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("\nCopy backend/.env.example to backend/.env and fill in the values.\n");
  process.exit(1);
}

const config = parsed.data;

export const env = Object.freeze({
  ...config,
  isProduction: config.NODE_ENV === "production",
  isDevelopment: config.NODE_ENV === "development",
  isTest: config.NODE_ENV === "test",
  clientOrigins: config.CLIENT_URL.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  // Browsers reject SameSite=None cookies unless they are also Secure.
  cookieSecure: config.NODE_ENV === "production" || config.COOKIE_SAME_SITE === "none",
});
