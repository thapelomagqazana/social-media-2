import express from "express";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/followController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Follow a user
router.post("/:userId", protect, followUser);

// Unfollow a user
router.delete("/:userId", protect, unfollowUser);

// Get a user's followers
router.get("/followers/:userId", getFollowers);

// Get a user's following list
router.get("/following/:userId", getFollowing);

export default router;
