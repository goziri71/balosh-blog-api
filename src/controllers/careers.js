import { TryCatchFunction } from "../utils/tryCatch/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";
import { UploadService } from "../service/upload.service.js";
import CareerApplication from "../models/CareerApplication.js";

const uploadService = new UploadService();

// POST /api/v1/careers/apply
export const applyForCareer = TryCatchFunction(async (req, res) => {
  const { firstName, lastName, phoneNumber, role, email } = req.body;

  if (!firstName || !lastName || !phoneNumber || !role) {
    throw new ErrorClass(
      "firstName, lastName, phoneNumber, and role are required",
      400
    );
  }

  if (!req.file) {
    throw new ErrorClass("CV file is required and must be a PDF", 400);
  }

  // Upload CV to storage
  const uploadResult = await uploadService.uploadCareerCv(req.file);

  const application = new CareerApplication({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phoneNumber: phoneNumber.trim(),
    role: role.trim(),
    email: email ? String(email).trim().toLowerCase() : undefined,
    cvUrl: uploadResult.url,
    cvPath: uploadResult.path,
  });

  await application.save();

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: {
      application,
    },
  });
});

// GET /api/v1/careers
export const getCareerCvs = TryCatchFunction(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const [applications, total] = await Promise.all([
    CareerApplication.find(
      {},
      {
        firstName: 1,
        lastName: 1,
        phoneNumber: 1,
        email: 1,
        role: 1,
        cvUrl: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    CareerApplication.countDocuments({}),
  ]);

  res.json({
    success: true,
    data: {
      items: applications,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize) || 1,
      },
    },
  });
});
