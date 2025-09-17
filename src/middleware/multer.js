import multer from "multer";
import { ErrorClass } from "../utils/errorClass/index.js";

// Configure multer for memory storage (we'll upload to Supabase)
const storage = multer.memoryStorage();

// Profile photo filter
const profilePhotoFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new ErrorClass("Only JPEG, PNG, and WebP images are allowed", 400),
      false
    );
  }
};

// Blog media filter (images and videos)
const blogMediaFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|ogg/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new ErrorClass(
        "Only JPEG, PNG, WebP, GIF images and MP4, WebM, OGG videos are allowed",
        400
      ),
      false
    );
  }
};

// Careers CV filter (PDF only)
const careerCvFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = file.mimetype === "application/pdf";

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorClass("Only PDF files are allowed for CV upload", 400), false);
  }
};

// Profile photo upload
const profileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profiles
  },
  fileFilter: profilePhotoFilter,
});

// Blog media upload
const blogUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for blog media
  },
  fileFilter: blogMediaFilter,
});

// Career CV upload
const careerCvUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for CVs
  },
  fileFilter: careerCvFilter,
});

export const uploadSingle = profileUpload.single("profilePhoto");
export const uploadBlogMedia = blogUpload.single("featuredImage");
export const uploadCareerCv = careerCvUpload.single("cv");

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(new ErrorClass("File too large.", 400));
    }
  }

  if (error instanceof ErrorClass) {
    return next(error);
  }

  next(error);
};
