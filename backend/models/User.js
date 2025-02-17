import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Schema for MongoDB using Mongoose
 * @property {String} name - The full name of the user (Required)
 * @property {String} displayName - The user's display name (Optional)
 * @property {String} email - The email of the user (Unique, Required)
 * @property {String} password - The hashed password of the user (Required)
 * @property {String} profilePicture - URL to the profile picture (Optional)
 * @property {String} bio - Short bio for the user (Optional, max 150 chars)
 * @property {Array} interests - Array of user's selected interests (Optional)
 * @property {Boolean} isVerified - Flag to indicate if the email is verified (Default: false)
 * @property {String} verificationToken - Token used for email verification
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    displayName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    profilePicture: {
      type: String, // URL to profile picture
      default: "",
    },
    bio: {
      type: String,
      maxlength: [150, "Bio must be at most 150 characters"],
      default: "",
    },
    interests: {
      type: [String], // Array of interests
      default: [],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
 
    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // verificationToken: {
    //   type: String,
    // },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);

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

// Export the User model
const User = mongoose.model("User", UserSchema);
export default User;
