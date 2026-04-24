import User from "../models/User.js";
import mongoose from "mongoose";
import { generateAccessToken } from "../utils/generateToken.js";

// Extract names helper
const extractNames = (body = {}) => {
  if (body.firstName && body.lastName) {
    return {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
    };
  }

  if (body.name) {
    const parts = body.name.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "User",
    };
  }

  return { firstName: "", lastName: "" };
};

// GET all users (ADMIN)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json({ success: true, data: users });
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

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REGISTER user
export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const { firstName, lastName } = extractNames(req.body);

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accessToken: generateAccessToken(user),
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accessToken: generateAccessToken(user),
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user (ADMIN)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "User deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};