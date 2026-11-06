import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adminListProducts,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public reads
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only management
// Note: declare the /admin/all sub-route BEFORE /:id so it isn't shadowed.
router.get("/admin/all", protect, authorize("admin"), adminListProducts);
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
