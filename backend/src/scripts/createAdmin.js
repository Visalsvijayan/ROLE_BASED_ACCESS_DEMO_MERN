import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { registerBody } from "../validators/authValidators.js";

/**
 * Creates the first admin (or promotes an existing account to admin).
 * Safe for production: it never deletes anything.
 *
 * Put these three lines in backend/.env (or in your host's environment
 * variables), run the command ONCE, then remove them again:
 *
 *   ADMIN_NAME=Your Name
 *   ADMIN_EMAIL=you@example.com
 *   ADMIN_PASSWORD=a-strong-password-1
 *
 *   npm run create-admin
 */
const run = async () => {
  const input = registerBody.safeParse({
    name: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });

  if (!input.success) {
    console.error("Cannot create admin:");
    for (const issue of input.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error("\nSet ADMIN_EMAIL and ADMIN_PASSWORD (and optionally ADMIN_NAME). See the README.");
    process.exit(1);
  }

  const { name, email, password } = input.data;

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = ROLES.ADMIN;
      existing.isActive = true;
      await existing.save();
      console.log(`Existing account ${email} is now an active admin (password unchanged).`);
    } else {
      await User.create({ name, email, password, role: ROLES.ADMIN });
      console.log(`Admin account created: ${email}`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
};

run();
