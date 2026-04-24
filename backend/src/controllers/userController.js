import User from "../models/User.js";
import mongoose from "mongoose";

// GET all users

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET single user
export const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE user (admin); self-serve profile uses /api/auth/profile
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const payload = { ...req.body };
    if (req.user.role !== "admin") {
      delete payload.role;
    }
    delete payload.passwordHash;
    delete payload.refreshToken;
    delete payload.googleId;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own account here" });
  }
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ success: true, message: "User deleted" });
};
