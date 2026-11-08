import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { paginate } from "../utils/pagination.js";
import { revokeAllSessions } from "./authService.js";

const notFound = () => ApiError.notFound("User not found");

export const listUsers = ({ page, limit, search }) => {
  const filter = {};
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  return paginate(User, filter, { page, limit, select: "-__v" });
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select("-__v").lean();
  if (!user) throw notFound();
  return user;
};

export const setUserActive = async ({ actorId, targetId, isActive }) => {
  // Stops the only admin from locking themselves out.
  if (!isActive && String(actorId) === targetId) {
    throw ApiError.badRequest("You cannot deactivate your own account");
  }

  const user = await User.findById(targetId);
  if (!user) throw notFound();

  user.isActive = isActive;
  await user.save();

  // A deactivated user must be logged out everywhere, right now.
  if (!isActive) await revokeAllSessions(user._id);

  return user;
};

export const deleteUser = async ({ actorId, targetId }) => {
  if (String(actorId) === targetId) {
    throw ApiError.badRequest("You cannot delete your own account");
  }

  const user = await User.findById(targetId);
  if (!user) throw notFound();

  await user.deleteOne();
  await revokeAllSessions(user._id);
};
