import * as productService from "../services/productService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/products - public. Active products only, paginated. */
export const listProducts = asyncHandler(async (req, res) => {
  res.json(await productService.listProducts(req.query));
});

/** GET /api/products/:id - public. */
export const getProduct = asyncHandler(async (req, res) => {
  res.json(await productService.getProductById(req.params.id));
});

/** GET /api/products/admin/all - admin. Includes inactive products. */
export const adminListProducts = asyncHandler(async (req, res) => {
  res.json(await productService.listProducts(req.query, { includeInactive: true }));
});

/** GET /api/products/admin/:id - admin. Can load inactive products (for editing). */
export const adminGetProduct = asyncHandler(async (req, res) => {
  res.json(await productService.getProductById(req.params.id, { includeInactive: true }));
});

/** POST /api/products - admin. */
export const createProduct = asyncHandler(async (req, res) => {
  res.status(201).json(await productService.createProduct(req.body));
});

/** PUT /api/products/:id - admin. */
export const updateProduct = asyncHandler(async (req, res) => {
  res.json(await productService.updateProduct(req.params.id, req.body));
});

/** DELETE /api/products/:id - admin. */
export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ message: "Product deleted", _id: req.params.id });
});
