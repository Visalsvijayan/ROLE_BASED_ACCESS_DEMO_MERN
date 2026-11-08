import { Router } from "express";
import { register, login, refresh, logout, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { registerBody, loginBody } from "../validators/authValidators.js";

const router = Router();

// Responses here contain tokens: make sure no browser or proxy ever caches them.
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.post("/register", authLimiter, validate({ body: registerBody }), register);
router.post("/login", authLimiter, validate({ body: loginBody }), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
