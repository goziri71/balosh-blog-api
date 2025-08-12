import express from "express";
import { authorize } from "../middleware/auth.js";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - just need JWT
router.get("/profile", authorize, getProfile);
router.put("/profile", authorize, updateProfile);
router.put("/change-password", authorize, changePassword);

export default router;
