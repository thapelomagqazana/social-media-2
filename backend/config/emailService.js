import nodemailer from "nodemailer";

/**
 * Nodemailer transporter configuration for sending emails
 */
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @desc Send verification email to the user
 * @param {string} email - The user's email address
 * @param {string} token - The verification token
 * @returns {Promise<void>} - Returns a promise indicating the email status
 */
exports.sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click the link below to verify your email:</p><a href="${verificationLink}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
