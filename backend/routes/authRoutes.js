import express from "express";
import { registerUser } from "../controllers/authController";
import { validateSignup } from "../middleware/validateRequest";

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 */
router.post("/signup", validateSignup, registerUser);

module.exports = router;
