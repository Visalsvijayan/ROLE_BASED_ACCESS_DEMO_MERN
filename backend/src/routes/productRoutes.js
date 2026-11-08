import { Router } from "express";
import {
  listProducts,
  getProduct,
  adminListProducts,
  adminGetProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { ROLES } from "../constants/roles.js";
import { idParams } from "../validators/common.js";
import {
  listProductsQuery,
  createProductBody,
  updateProductBody,
} from "../validators/productValidators.js";

const router = Router();
const adminOnly = [protect, authorize(ROLES.ADMIN)];

// Public reads
router.get("/", validate({ query: listProductsQuery }), listProducts);

// Admin reads. These MUST be declared before "/:id", otherwise Express would
// treat the word "admin" as a product id.
router.get("/admin/all", ...adminOnly, validate({ query: listProductsQuery }), adminListProducts);
router.get("/admin/:id", ...adminOnly, validate({ params: idParams }), adminGetProduct);

router.get("/:id", validate({ params: idParams }), getProduct);

// Admin writes
router.post("/", ...adminOnly, validate({ body: createProductBody }), createProduct);
router.put(
  "/:id",
  ...adminOnly,
  validate({ params: idParams, body: updateProductBody }),
  updateProduct
);
router.delete("/:id", ...adminOnly, validate({ params: idParams }), deleteProduct);

export default router;
