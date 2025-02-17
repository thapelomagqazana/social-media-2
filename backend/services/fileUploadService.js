import multer from "multer";
import path from "path";

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

// Fix File Type Validation (Return 400 Instead of 500)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Instead of throwing an error, return a controlled message
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type. Only JPG and PNG are allowed."));
  }
};

// File size limit (5MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Custom Error Handler for Multer
const uploadMiddleware = (req, res, next) => {
  upload.single("profilePicture")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Properly handle file errors and return 400
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Catch any other errors
      return res.status(500).json({ message: "File upload failed. Please try again." });
    }
    next();
  });
};

export default uploadMiddleware;
