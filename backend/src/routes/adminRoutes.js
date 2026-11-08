import { Router } from "express";
import { getStats } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/stats", getStats);

export default router;
