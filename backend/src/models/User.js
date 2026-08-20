import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false }, // optional for Google OAuth users
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },

    // OAuth
    googleId: { type: String },
    avatar: { type: String },
    provider: { type: String, default: "email" }, // 'email' | 'google'

    // Token rotation
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Hash password before save (only for email users)
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);

  next();
});

export default mongoose.model("User", userSchema);