import { z } from "zod";
import { paginationShape, searchQuery } from "./common.js";

export const listUsersQuery = z.object({
  ...paginationShape(),
  search: searchQuery,
});

export const updateUserStatusBody = z.object({
  isActive: z.boolean({
    required_error: "isActive is required",
    invalid_type_error: "isActive must be true or false",
  }),
});
