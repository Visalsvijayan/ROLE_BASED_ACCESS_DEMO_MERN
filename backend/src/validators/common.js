import { z } from "zod";

/** A required string with friendly messages: str("Name") -> "Name is required". */
export const str = (label) =>
  z.string({
    required_error: `${label} is required`,
    invalid_type_error: `${label} must be text`,
  });

/** A 24-character hex MongoDB ObjectId. Rejects junk before it reaches the database. */
export const objectId = str("Id").regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const idParams = z.object({ id: objectId });

/** ?page=2&limit=10  (query strings arrive as text, so we coerce to numbers). */
export const paginationShape = (defaultLimit = 10) => ({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(defaultLimit),
});

export const searchQuery = z.string().trim().max(100).optional();
