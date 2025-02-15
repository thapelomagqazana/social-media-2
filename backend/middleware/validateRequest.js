import { body, validationResult } from "express-validator";

/**
 * @desc Middleware to validate user signup input fields
 */
exports.validateSignup = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("name").trim()
  .isLength({ max: 255 })
  .withMessage("Name is too long. Max 255 characters allowed."),
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("email").trim().isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
