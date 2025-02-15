import User from "../models/User";
import jwt from "jsonwebtoken";
import validator from "validator";

// const { sendVerificationEmail } = require("../config/emailService");
// const { generateToken } = require("../utils/generateToken");

/**
 * @desc Register a new user
 * @route POST /api/auth/signup
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Allow Unicode characters (Japanese, Chinese, Arabic, etc.)
    const isLatin = /^[A-Za-z0-9\s]+$/.test(name); // Check for Latin letters & numbers
    const isUnicode = /^[\p{L}\p{N}\s-]+$/u.test(name); // Check for ALL languages

    if (!isLatin && !isUnicode) {
      return res.status(400).json({ message: "Invalid name format. Name can contain letters, numbers, and spaces." });
    }

    // Create a new user with verification token
    const newUser = new User({ name: name.trim(), email: normalizedEmail, password });
    await newUser.save();

    // Send verification email (optional feature)
    // await sendVerificationEmail(user.email, user.verificationToken);

    res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
