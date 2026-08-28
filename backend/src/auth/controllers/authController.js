import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate Access Token (SHORT LIFE)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Generate Refresh Token (LONG LIFE)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Send Refresh Token via HTTP-only cookie
const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false, // set TRUE in production (HTTPS)
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// REGISTER
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const assignedRole = ["user", "admin", "staff"].includes(role) ? role : "user";

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password, // auto hashed
      role: assignedRole,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

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
      message: "Login successful",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GOOGLE AUTH
export const googleAuth = async (req, res) => {
  const idToken = req.body.idToken || req.body.credential || req.body.token;

  if (!idToken) {
    return res.status(400).json({ message: "Google ID token required" });
  }

  try {
    let payload;

    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      const base64Payload = idToken.split(".")[1];
      payload = JSON.parse(Buffer.from(base64Payload, "base64").toString("utf-8"));
    }

    const { email, given_name, family_name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
    } else {
      user = new User({
        firstName: given_name || email.split("@")[0],
        lastName: family_name || "",
        email,
        googleId,
        avatar: picture || "",
        provider: "google",
        role: "user",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.json({
      success: true,
      message: "Google login successful",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        accessToken,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed", error: error.message });
  }
};

// REFRESH ACCESS TOKEN
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    sendRefreshToken(res, newRefreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Refresh token expired or invalid" });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
    } catch {
      // ignore
    }
  }

  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
};

// GET CURRENT USER PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
