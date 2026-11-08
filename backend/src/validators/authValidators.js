import { z } from "zod";
import { str } from "./common.js";

const email = str("Email")
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address")
  .max(254, "Email is too long");

// bcrypt only uses the first 72 bytes of a password, hence the upper limit.
const newPassword = str("Password")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

export const registerBody = z.object({
  name: str("Name")
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email,
  password: newPassword,
});

// Login does NOT enforce the password rules: it only checks what was typed.
export const loginBody = z.object({
  email,
  password: str("Password").min(1, "Password is required").max(72, "Invalid credentials"),
});
