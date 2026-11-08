import * as userService from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/users - admin. Paginated, optional ?search= */
export const getUsers = asyncHandler(async (req, res) => {
  res.json(await userService.listUsers(req.query));
});

/** GET /api/users/:id - admin. */
export const getUserById = asyncHandler(async (req, res) => {
  res.json(await userService.getUserById(req.params.id));
});

/** PATCH /api/users/:id/status - admin. Activate or deactivate a user. */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.setUserActive({
    actorId: req.user._id,
    targetId: req.params.id,
    isActive: req.body.isActive,
  });
  res.json(user);
});

/** DELETE /api/users/:id - admin. */
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser({ actorId: req.user._id, targetId: req.params.id });
  res.json({ message: "User deleted", _id: req.params.id });
});
