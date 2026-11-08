import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { ROLES } from "../constants/roles.js";
import { idParams } from "../validators/common.js";
import { listUsersQuery, updateUserStatusBody } from "../validators/userValidators.js";

const router = Router();

// Every user-management route requires a logged-in admin.
router.use(protect, authorize(ROLES.ADMIN));

router.get("/", validate({ query: listUsersQuery }), getUsers);
router.get("/:id", validate({ params: idParams }), getUserById);
router.patch(
  "/:id/status",
  validate({ params: idParams, body: updateUserStatusBody }),
  updateUserStatus
);
router.delete("/:id", validate({ params: idParams }), deleteUser);

export default router;
