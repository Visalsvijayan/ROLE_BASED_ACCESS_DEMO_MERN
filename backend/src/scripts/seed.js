import { env } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import RefreshToken from "../models/RefreshToken.js";
import { ROLES } from "../constants/roles.js";
import { logger } from "../utils/logger.js";

/**
 * DEMO seed script (development only)
 * -----------------------------------
 * WIPES the users, products and sessions collections, then inserts:
 *   - 1 admin, 1 normal user
 *   - a few sample products
 *
 * Run with:  npm run seed
 *
 * It refuses to run in production. To create the first real admin there, use
 * `npm run create-admin` instead.
 */

const DEMO_USERS = [
  { name: "Admin User", email: "admin@example.com", password: "Admin@123", role: ROLES.ADMIN },
  { name: "Normal User", email: "user@example.com", password: "User@123", role: ROLES.USER },
];

const DEMO_PRODUCTS = [
  {
    name: "Wireless Headphones",
    description: "Over-ear Bluetooth headphones with 30h battery life.",
    price: 89.99,
    category: "Electronics",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 119,
    category: "Electronics",
    stock: 15,
  },
  {
    name: "Cotton T-Shirt",
    description: "100% cotton, unisex, available in multiple sizes.",
    price: 19.5,
    category: "Clothing",
    stock: 100,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "750ml insulated bottle, keeps drinks cold for 24h.",
    price: 24,
    category: "Home",
    stock: 50,
  },
];

const seed = async () => {
  if (env.isProduction) {
    logger.error("Refusing to run the demo seed in production (it deletes all data).");
    logger.error("Use `npm run create-admin` to create your first admin instead.");
    process.exit(1);
  }

  try {
    await connectDB();

    await Promise.all([User.deleteMany({}), Product.deleteMany({}), RefreshToken.deleteMany({})]);

    // Passwords are hashed by the User model's pre-save hook.
    await User.create(DEMO_USERS);
    await Product.create(DEMO_PRODUCTS);

    console.log("Seed complete. Demo logins:");
    for (const { role, email, password } of DEMO_USERS) {
      console.log(`  ${role.padEnd(5)}  ${email}  /  ${password}`);
    }
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
