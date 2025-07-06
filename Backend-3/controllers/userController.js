const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
require("dotenv").config({ path: "./config.env" });

const PORT = process.env.PORT;

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.myEmail,
    pass: process.env.myEmailPassword,
  },
});

const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    console.log({ user: user.username }); // <-- Debugging

    res.json({
      message: "Login successful",
      user: {
        username: user.username, // <-- Correct structure
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userLogout = (req, res) => {
  try {
    // If using sessions, destroy it
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log out" });
        }
        res.status(200).json({ message: "Logout successful" });
      });
    } else {
      res.status(200).json({ message: "Logout successful" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate Token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send Email
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: "LUSTRA - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #007bff;">LUSTRA - Password Reset</h2>
            <p style="font-size: 16px; color: #333;">
              You requested a password reset for your LUSTRA account. Click the button below to reset your password.
            </p>
            <a href="${resetLink}" 
              style="display: inline-block; background-color: #007bff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
              Reset Password
            </a>
            <p style="margin-top: 20px; font-size: 14px; color: #555;">
              If you did not request this, please ignore this email.
            </p>
            <p style="font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} LUSTRA. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
console.log("JWT Secret:", process.env.JWT_SECRET);

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("New Hashed Password:", hashedPassword);

    // Ensure password is updated
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiration: null,
      },
      { new: true } // Ensures the latest document is returned
    );

    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
};
