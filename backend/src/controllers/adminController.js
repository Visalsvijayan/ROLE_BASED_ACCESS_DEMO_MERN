import { getDashboardStats } from "../services/statsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/admin/stats - admin. Totals for the dashboard. */
export const getStats = asyncHandler(async (_req, res) => {
  res.json(await getDashboardStats());
});
