import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";

/**
 * Seed script
 * -----------
 * Wipes the User and Product collections and inserts:
 *   - 1 admin
 *   - 1 user
 *   - a few sample products
 *
 * Run with:  npm run seed
 */

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Product.deleteMany({});

    // Passwords are hashed automatically by the User model pre-save hook
    await User.create([
      {
        name: "Admin User",
        email: "admin@gmail.com",
        password: "123456",
        role: "admin",
      },
      {
        name: "Normal User",
        email: "user@gmail.com",
        password: "123456",
        role: "user",
      },
    ]);

    await Product.create([
      {
        name: "Wireless Headphones",
        description: "Over-ear Bluetooth headphones with 30h battery life.",
        price: 89.99,
        category: "Electronics",
        image: "https://via.placeholder.com/400x300?text=Headphones",
        stock: 25,
      },
      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches.",
        price: 119.0,
        category: "Electronics",
        image: "https://via.placeholder.com/400x300?text=Keyboard",
        stock: 15,
      },
      {
        name: "Cotton T-Shirt",
        description: "100% cotton, unisex, available in multiple sizes.",
        price: 19.5,
        category: "Clothing",
        image: "https://via.placeholder.com/400x300?text=T-Shirt",
        stock: 100,
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "750ml insulated bottle, keeps drinks cold for 24h.",
        price: 24.0,
        category: "Home",
        image: "https://via.placeholder.com/400x300?text=Bottle",
        stock: 50,
      },
    ]);

    console.log("✅ Seed complete:");
    console.log("   admin@example.com / Admin@123");
    console.log("   user@example.com  / User@123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
