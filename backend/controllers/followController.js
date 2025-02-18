import User from "../models/User.js";
import mongoose from "mongoose";

/**
 * @desc Follow a user
 * @route POST /api/follow/:userId
 * @access Private
 */
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params; // ID of the user to follow
    const currentUserId = req.user.id; // ID of the authenticated user

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent duplicate follows
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "You are already following this user." });
    }

    // Add to following & followers list
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: `You are now following ${userToFollow.name}.` });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};

/**
 * @desc Unfollow a user
 * @route DELETE /api/follow/:userId
 * @access Private
 */
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user is actually following the target user
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "You are not following this user." });
    }

    // Remove from following & followers list
    currentUser.following = currentUser.following.filter((id) => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: `You have unfollowed ${userToUnfollow.name}.` });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};

/**
 * @desc Get list of followers
 * @route GET /api/users/:userId/followers
 * @access Public
 */
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(userId).populate("followers", "name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the user has a private account and the requester is not following them
    if (user.isPrivate && !user.followers.includes(currentUserId)) {
      return res.status(403).json({ message: "This user's followers list is private." });
    }

    res.status(200).json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};

/**
 * @desc Get list of users followed by the user
 * @route GET /api/users/:userId/following
 * @access Public
 */
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("following", "name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};
