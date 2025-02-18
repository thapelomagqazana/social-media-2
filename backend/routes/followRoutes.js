import express from "express";
import { followUser, unfollowUser } from "../controllers/followController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Follow a user
router.post("/:userId", protect, followUser);

// Unfollow a user
router.delete("/:userId", protect, unfollowUser);

export default router;
