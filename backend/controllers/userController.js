/**
 * @fileoverview User Controller
 * @module controllers/userController
 * @description Implements logic for user CRUD operations.
 */

import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
/**
 * @function getUsers
 * @description Retrieves all users from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing a list of users (excluding passwords).
 */
export const getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.query.role) {
      query.role = req.query.role; // Apply role filter
    }
    // Fetch all users, excluding passwords for security
    const users = await User.find(query).select("-password");
    res.json({users: users});
  } catch (error) {
    // console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @function getUserById
 * @description Retrieves a user by ID.
 * @param {Object} req - Express request object containing `userId` as a URL parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing the user data (excluding password).
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Ensure user can only fetch their profile or admin can fetch any user
    if (!isAdmin && userId !== requesterId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // XSS Attack Prevention
    const xssRegex = /<script>|<\/script>/i;
    if (xssRegex.test(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Validate ObjectID format
    if (!mongoose.Types.ObjectId.isValid(userId) || !isNaN(userId) || userId.length > 24) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/:userId
 * @access Private
 */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, bio, interests, displayName } = req.body;
    const authUserId = req.user.id; // Extracted from JWT token

    // Check if the authenticated user is updating their own profile
    if (userId !== authUserId) {
      return res.status(403).json({ message: "Unauthorized to update this profile." });
    }

    // Handle Multer File Upload Errors
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    // Validate email format
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate password length
    if (password && password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    // Prepare update object
    let updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.trim().toLowerCase();
    if (bio) updateFields.bio = bio;
    if (displayName) updateFields.displayName = displayName.trim();
    if (interests) updateFields.interests = Array.isArray(interests) ? interests : interests.split(",");

    // Handle password hashing (if updated)
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    // Handle profile picture upload
    if (req.file) {
      updateFields.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Use `findOneAndUpdate()` for better performance
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId }, // Find user by ID
      { $set: updateFields }, // Update only provided fields
      { new: true, runValidators: true } // Return updated user & validate fields
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send successful response
    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        interests: updatedUser.interests,
        displayName: updatedUser.displayName
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


/**
 * @function deleteUser
 * @description Deletes a user from the database.
 * @param {Object} req - Express request object containing `userId` as a URL parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response confirming user deletion.
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Validate ObjectID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent Non-Admin from deleting other users
    if (requesterId !== userId && requesterRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Send appropriate messages
    if (requesterId === userId) {
      return res.status(200).json({ message: "Your account has been deleted" });
    } else {
      return res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};