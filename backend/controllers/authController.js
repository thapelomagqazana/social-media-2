import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../config/emailService.js";

/**
 * @desc Register a new user and return authentication token
 * @route POST /api/auth/signup
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use. Try logging in instead." });
    }

    // Allow Unicode characters (Japanese, Chinese, Arabic, etc.)
    const isLatin = /^[A-Za-z0-9\s]+$/.test(name); // Check for Latin letters & numbers
    const isUnicode = /^[\p{L}\p{N}\s-]+$/u.test(name); // Check for ALL languages

    if (!isLatin && !isUnicode) {
      return res.status(400).json({ message: "Invalid name format. Name can contain letters, numbers, and spaces." });
    }

    // Create a new user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token, // Return JWT Token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * @desc Sign in user
 * @route POST /api/auth/signin
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signInUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email. Sign up instead?" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Try again." });
    }

    const expiration = rememberMe ? "7d" : "1h"; // Remember Me: 7 days, else 1 hour
    const token = generateToken(user.id, user.role, expiration);

    res.status(200).json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokenExpiration: expiration,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * @desc Forgot Password - Sends reset link
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Normalize email (trim spaces & lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Send reset email only if not in test mode
    if (process.env.NODE_ENV !== "test") {
      await sendEmail(user.email, resetToken);
    }

    res.status(200).json({ message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * @desc Reset Password - Sets new password
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate token presence
    if (!token) {
      return res.status(404).json({ message: "Token is required." });
    }

    // Validate new password input
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    if (newPassword.length > 64) {
      return res.status(400).json({ message: "Password is too long. Max length is 64 characters." });
    }

    // if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/g.test(newPassword)) {
    //   return res.status(400).json({ message: "Password is too weak. Use a mix of letters, numbers, and symbols." });
    // }

    if (/\s/.test(newPassword)) {
      return res.status(400).json({ message: "Password cannot contain spaces." });
    }

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token." });
    }

    // Ensure the user is still active
    if (!user.active) {
      return res.status(400).json({ message: "User is inactive or deleted." });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};



/**
 * @function logoutUser
 * @description Logs out a user by clearing JWT and validating the request token.
 * @route GET /api/auth/signout
 * @access Protected
 */
export const logoutUser = async (req, res) => {
  try {
    let token = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.trim().split(" ")[1]
      : null;

    // Check if token exists in cookie
    if (!token && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Clear the JWT cookie (if used)
    res.clearCookie("jwt");

    return res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

