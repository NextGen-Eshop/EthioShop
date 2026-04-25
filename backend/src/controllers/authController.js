import User from "../models/User.js";


// Generate Access Token (SHORT LIFE)

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m", // short-lived
  });
};


// Generate Refresh Token (LONG LIFE)

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};


// Send Refresh Token via HTTP-only cookie
 
const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false, //  set TRUE in production (HTTPS)
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

 // REGISTER

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password, // auto hashed
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // store refresh token in DB
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
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 // LOGIN

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 // REFRESH TOKEN

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

    // rotate tokens
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
    res.status(403).json({ message: "Token expired or invalid" });
  }
};


 // LOGOUT

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

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 // GET PROFILE
 
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    success: true,
    data: user,
  });
};

 // UPDATE PROFILE
 
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.passwordHash = req.body.password; // auto-hashed
    }

    const updatedUser = await user.save();

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


 //ADMIN: GET USERS

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 // ADMIN: DELETE USER

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};