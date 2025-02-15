import mongoose from "mongoose";
import bcrypt from "bcryptjs"

/**
 * User Schema for MongoDB using Mongoose
 * @property {String} name - The name of the user (Required)
 * @property {String} email - The email of the user (Unique, Required)
 * @property {String} password - The hashed password of the user (Required)
 * @property {Boolean} isVerified - Flag to indicate if the email is verified (Default: false)
 * @property {String} verificationToken - Token used for email verification
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
  },
  // isVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  // verificationToken: String,
});

/**
 * Hash password before saving user to database
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Compare entered password with the stored hashed password
 * @param {String} enteredPassword - Password entered by user
 * @returns {Boolean} - Returns true if passwords match, false otherwise
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
