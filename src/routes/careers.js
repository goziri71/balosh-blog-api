import express from "express";
import { applyForCareer, getCareerCvs } from "../controllers/careers.js";
import { authorize } from "../middleware/auth.js";
import { uploadCareerCv, handleMulterError } from "../middleware/multer.js";

const router = express.Router();

// Public endpoint to submit a career application with a CV (PDF)
router.post("/apply", uploadCareerCv, handleMulterError, applyForCareer);
router.get("/", authorize, getCareerCvs);

export default router;
