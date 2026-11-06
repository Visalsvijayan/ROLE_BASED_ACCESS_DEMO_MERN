import User from "../models/User.js";

/**
 * GET /api/users
 * Admin only. List all users.
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Admin only. Get a single user.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/status
 * Admin only. Activate or deactivate a user.
 * Prevents an admin from deactivating themselves.
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive (boolean) is required" });
    }

    if (req.user._id.toString() === req.params.id && isActive === false) {
      return res
        .status(400)
        .json({ message: "You cannot deactivate your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only. Permanently delete a user.
 * Prevents an admin from deleting themselves.
 */
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted", _id: req.params.id });
  } catch (error) {
    next(error);
  }
};
