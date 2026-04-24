import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false, default: null, select: false },
    role: {
      type: String,
      enum: ["admin", "manager", "customer", "user"],
      default: "customer",
    },
    googleId: { type: String, sparse: true, unique: true, index: true },
    picture: { type: String, maxlength: 2000 },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || this.passwordHash == null) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

export default mongoose.model("User", userSchema);
