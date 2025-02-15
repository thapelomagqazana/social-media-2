import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * @description Sends a email with a reset link for either password reset or verification
 * @param {string} userEmail - Recipient's email
 * @param {string} resetToken - Unique password reset token
 */
export const sendEmail = async (userEmail, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use 'gmail' or your SMTP provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // App password (not your personal password)
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color: #1DA1F2; font-weight: bold;">Reset Your Password</a>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email.");
  }
};
