import jwt from "jsonwebtoken";

/**
 * @description Generate JWT Token for user authentication
 * @param {string} userId - The user ID to generate a token for
 * @param {boolean} rememberMe - If true, extends token expiration
 * @returns {string} JWT token
 */
export const generateToken = (userId, expiration) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expiration,
  });
};
