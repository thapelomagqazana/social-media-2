/**
 * @fileoverview User Routes
 * @module routes/userRoutes
 * @description Defines API endpoints for user CRUD operations.
 */

import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, validateQueryParams } from "../middleware/authMiddleware.js";
import upload from "../services/fileUploadService.js";

const router = express.Router();

/**
 * @route GET /api/users
 * @description Retrieves all users.
 * @access Protected (Requires authentication)
 */
router.get("/", protect, validateQueryParams, getUsers);

/**
 * @route GET /api/users/:userId
 * @description Retrieves a single user by ID.
 * @access Protected (Requires authentication)
 */
router.get("/:userId", protect, getUserById);

/**
 * @route PUT /api/users/:userId
 * @desc Update user profile
 * @access Private
 */
router.put("/:userId", protect, upload.single("profilePicture"), updateUser);

/**
 * @route DELETE /api/users/:userId
 * @description Deletes a user account (only the signed-in user can delete their own account).
 * @access Protected (Requires authentication & authorization)
 */
router.delete("/:userId", protect, deleteUser);

export default router;
