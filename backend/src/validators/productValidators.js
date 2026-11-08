import { z } from "zod";
import { str, paginationShape, searchQuery } from "./common.js";

const imageUrl = str("Image")
  .trim()
  .max(500, "Image URL is too long")
  .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), "Image must be a valid http(s) URL");

/**
 * Only the fields listed here ever reach the database. Anything else in the
 * request body (for example an attempt to set `_id` or `createdAt`) is dropped.
 */
export const createProductBody = z.object({
  name: str("Name").trim().min(1, "Name is required").max(120, "Name must be at most 120 characters"),
  description: str("Description")
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be at most 2000 characters"),
  price: z
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative")
    .max(10_000_000, "Price is too large"),
  category: str("Category")
    .trim()
    .min(1, "Category is required")
    .max(60, "Category must be at most 60 characters"),
  image: imageUrl.optional(),
  stock: z
    .number({ required_error: "Stock is required", invalid_type_error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock is too large"),
  isActive: z.boolean({ invalid_type_error: "isActive must be true or false" }).optional(),
});

export const updateProductBody = createProductBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Provide at least one field to update");

export const listProductsQuery = z.object({
  ...paginationShape(12),
  search: searchQuery,
  category: z.string().trim().max(60).optional(),
});
