import express from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All user-management routes require an authenticated admin
router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
