import express from "express";
import authRoutes from "./auth.js";
import blogRoutes from "./blogs.js";
import categoryRoutes from "./categories.js";
import careerRoutes from "./careers.js";

const router = express.Router();

// API version prefix
const API_PREFIX = "/api/v1";

// Route prefixes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/blogs`, blogRoutes);
router.use(`${API_PREFIX}/categories`, categoryRoutes);
router.use(`${API_PREFIX}/careers`, careerRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Blog API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

export default router;
