import User from "../models/User.js";
import Product from "../models/Product.js";

/**
 * Dashboard numbers. The database counts them for us, so the browser never
 * has to download every user and product just to show a few totals.
 */
export const getDashboardStats = async () => {
  const [totalUsers, activeUsers, totalProducts, activeProducts, outOfStockProducts] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: 0 }),
    ]);

  return { totalUsers, activeUsers, totalProducts, activeProducts, outOfStockProducts };
};
