/**
 * @fileoverview User Controller
 * @module controllers/userController
 * @description Implements logic for user CRUD operations.
 */

import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * @route GET /api/users
 * @desc Get all users with pagination, filtering, sorting, and search (supports partial search)
 * @access Public (or Private if authentication is needed)
 */
export const getAllUsers = async (req, res) => {
  try {
    let searchFilter = {}; // Default search filter

    // Reject XML requests
    if (req.headers.accept && req.headers.accept.includes("application/xml")) {
      return res.status(406).json({ message: "XML format not supported. Use JSON." });
    }

    // Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting (?sort=name or ?sort=-createdAt)
    const sortBy = req.query.sort || "-createdAt";

    // Validate & sanitize search query (allow empty searches)
    let searchQuery = req.query.search?.trim();

    if (searchQuery === "") {
      return res.status(400).json({ message: "Invalid search query." });
    }
    
    // Reject queries with invalid characters
    if (searchQuery && /[^a-zA-Z0-9@._\s\-']/u.test(searchQuery)) {
      return res.status(400).json({ message: "Invalid search query." });
    }

    if (searchQuery) {
      searchFilter = {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { displayName: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    // Filtering logic (?role=admin or ?active=true)
    if (req.query.role) searchFilter.role = req.query.role;
    if (req.query.active !== undefined) searchFilter.active = req.query.active === "true";

    // Projection (Only return selected fields)
    const projection = "name email displayName role active profilePicture createdAt";

    // Fetch users with pagination, sorting, filtering, and search
    const users = await User.find(searchFilter)
      .select(projection)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Get total user count
    const totalUsers = await User.countDocuments(searchFilter);

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send JSON response with pagination metadata
    res.status(200).json({
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID
 * @access Public (or Private if authentication is needed)
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Fetch user by ID, excluding sensitive fields like password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
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

    // Ensure the authenticated user is updating their own profile
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

    // Validate bio length
    if (bio && bio.length > 150) {
      return res.status(400).json({ message: "Bio exceeded 150 characters." });
    }

    // Prepare update object
    let updateFields = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (bio) updateFields.bio = bio.trim();
    if (displayName) updateFields.displayName = displayName.trim().replace("@", "");

    // Ensure `interests` is an **array** if received as a **string**
    if (interests) {
      try {
        updateFields.interests = Array.isArray(interests) ? interests : JSON.parse(interests);
      } catch (error) {
        return res.status(400).json({ message: "Invalid interests format." });
      }
    }

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