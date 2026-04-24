import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { getPermissions } from "../config/roles.js";
import {
  sendWelcomeEmail,
} from "../services/emailService.js";

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export function buildUserPayload(user) {
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    name,
    email: user.email,
    role: user.role,
    picture: user.picture,
    permissions: getPermissions(user.role),
  };
}

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      passwordHash: password,
      role: "customer",
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    sendWelcomeEmail({ to: user.email, firstName: user.firstName }).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        ...buildUserPayload(user),
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.json({
      success: true,
      data: {
        ...buildUserPayload(user),
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authGoogle = async (req, res) => {
  const { idToken } = req.body;
  const audience = process.env.GOOGLE_CLIENT_ID;

  try {
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }
    if (!audience) {
      return res.status(503).json({ message: "Google sign-in is not configured on the server" });
    }

    const client = new OAuth2Client(audience);
    const ticket = await client.verifyIdToken({ idToken, audience });
    const p = ticket.getPayload();
    if (!p?.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const email = p.email.toLowerCase();
    const googleId = p.sub;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (p.picture) user.picture = p.picture;
      if (p.given_name) user.firstName = p.given_name;
      if (p.family_name) user.lastName = p.family_name;
    } else {
      const firstName = p.given_name || (p.name ? p.name.split(" ")[0] : "Google");
      const lastName =
        p.family_name || (p.name ? p.name.split(" ").slice(1).join(" ") : "User");
      user = await User.create({
        firstName,
        lastName,
        email,
        googleId,
        picture: p.picture || "",
        role: "customer",
      });
      sendWelcomeEmail({ to: user.email, firstName: user.firstName }).catch(() => {});
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.json({
      success: true,
      data: {
        ...buildUserPayload(user),
        accessToken,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message || "Google authentication failed" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    sendRefreshToken(res, newRefreshToken);

    res.json({ success: true, accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ success: true, data: buildUserPayload(user) });
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.firstName) user.firstName = String(req.body.firstName).trim();
    if (req.body.lastName) user.lastName = String(req.body.lastName).trim();
    if (req.body.email) user.email = String(req.body.email).toLowerCase().trim();
    if (req.body.password) {
      if (String(req.body.password).length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      user.passwordHash = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      data: buildUserPayload(updatedUser),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
