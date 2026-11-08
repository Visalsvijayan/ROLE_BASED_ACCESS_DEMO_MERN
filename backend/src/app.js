import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { ApiError } from "./utils/ApiError.js";

/**
 * The Express app, WITHOUT starting a server. Keeping this separate from
 * server.js lets the tests import the app and call it directly.
 */
const app = express();

// Behind a proxy (Render, Heroku, Nginx...) this makes req.ip the real client
// IP, which the rate limiter needs.
app.set("trust proxy", env.TRUST_PROXY);

app.use(helmet()); // sets a batch of security headers
app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = not a browser (curl, Postman, server-to-server): allow.
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      callback(ApiError.forbidden("Origin not allowed by CORS"));
    },
    credentials: true, // needed so the browser sends the refresh cookie
  })
);
app.use(compression());
if (!env.isTest) app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" })); // our payloads are tiny; reject huge bodies
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "MERN RBAC E-Commerce API is running" });
});

app.use("/api", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
