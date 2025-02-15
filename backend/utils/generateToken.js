import jwt from "jsonwebtoken";

/**
 * @desc Generate a JWT token
 * @param {string} email - User email
 * @returns {string} - Signed JWT token
 */
exports.generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
