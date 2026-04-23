import User from "../models/User.js";

// GET all users

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET single user
export const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

// REGISTER user
export const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password
  };

  users.push(newUser);

  res.status(201).json(newUser);
};

// LOGIN user
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user });
};

// UPDATE user
export const updateUser = async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(user);
};

// DELETE user
export const deleteUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};