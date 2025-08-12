import express from "express";
import { authorize } from "../middleware/auth.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Protected routes - just need JWT
router.post("/", authorize, createCategory);
router.put("/:id", authorize, updateCategory);
router.delete("/:id", authorize, deleteCategory);
router.put("/:id/toggle", authorize, toggleCategoryStatus);
router.put("/reorder", authorize, reorderCategories);

export default router;
