import express from "express";
import { 
    registerUser,
    signInUser,
    forgotPassword,
    resetPassword,
    logoutUser
} from "../controllers/authController";
import { 
    validateSignupRequest,
    validateSigninRequest,
    validateForgotPasswordRequest,
} from "../middleware/validateRequest";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware";

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === "test" ? 40 : 3, // Limit each IP to 3 requests per minute
  message: { message: "Too many requests. Please try again later." },
});

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user with provided email and password
 * @access Public
 * @param {Object} req - Express request object containing the user data
 * @param {Object} res - Express response object
 * @returns {Object} - Success message or error details
 */
router.post("/signup", validateSignupRequest, registerUser);

/**
 * @route POST /api/auth/signin
 * @desc Authenticate a user and return a JWT token
 * @access Public
 * @param {Object} req - Express request object containing the user's credentials (email and password)
 * @param {Object} res - Express response object with the generated token or error message
 * @returns {Object} - JWT token for authenticated users or error details
 */
router.post("/signin", validateSigninRequest, signInUser);

/**
 * @route POST /api/auth/reset-password
 * @desc Initiates the password reset process by sending a reset link to the user's email
 * @access Public
 * @param {Object} req - Express request object containing the user's email address
 * @param {Object} res - Express response object
 * @returns {Object} - Success message or error details
 */
router.post("/reset-password", validateForgotPasswordRequest, resetPasswordLimiter,forgotPassword);

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Resets the password using the provided token from the reset link
 * @access Public
 * @param {Object} req - Express request object containing the new password and the reset token from the email link
 * @param {Object} res - Express response object with success or error message
 * @returns {Object} - Success message or error details
 */
router.post("/reset-password/:token", resetPassword);

router.get("/signout", protect, logoutUser);

export default router;
