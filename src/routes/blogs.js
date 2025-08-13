import express from "express";
import { authorize, optionalAuth } from "../middleware/auth.js";
import { uploadBlogMedia, handleMulterError } from "../middleware/multer.js";
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  toggleLike,
  getBlogStats,
} from "../controllers/blogController.js";

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/stats", getBlogStats);
router.get("/:slug", getBlogBySlug);

// Protected routes - just need JWT
router.post("/", authorize, uploadBlogMedia, handleMulterError, createBlog);
router.put("/:id", authorize, uploadBlogMedia, handleMulterError, updateBlog);
router.delete("/:id", authorize, deleteBlog);

// Public like endpoint - optional authentication (works for both anonymous and logged-in users)
router.post("/:id/like", optionalAuth, toggleLike);

export default router;
