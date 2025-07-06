const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// إنشاء Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: Date,
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema, "users");
