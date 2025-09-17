import storageClient from "../suparbase/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";

export class UploadService {
  constructor() {
    this.profileBucket = "profile-photos";
    this.blogBucket = "blog-media"; // Separate bucket for blog media
    this.careerBucket = "career-cvs"; // Bucket for career CVs
  }

  async uploadProfilePhoto(file, userId) {
    try {
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await storageClient
        .from(this.profileBucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new ErrorClass(`Upload failed: ${error.message}`, 400);
      }

      // Get public URL
      const { data: urlData } = storageClient
        .from(this.profileBucket)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
      };
    } catch (error) {
      throw new ErrorClass(error.message || "File upload failed", 400);
    }
  }

  async deleteProfilePhoto(filePath) {
    try {
      const { error } = await storageClient
        .from(this.profileBucket)
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        // Don't throw error for delete failures, just log
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  // Upload blog featured image or media
  async uploadBlogMedia(file, userId, blogId = null) {
    try {
      const fileExt = file.originalname.split(".").pop();
      const timestamp = Date.now();
      const fileName = blogId
        ? `${blogId}-${timestamp}.${fileExt}`
        : `${userId}-${timestamp}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await storageClient
        .from(this.blogBucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new ErrorClass(`Upload failed: ${error.message}`, 400);
      }

      // Get public URL
      const { data: urlData } = storageClient
        .from(this.blogBucket)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
      };
    } catch (error) {
      throw new ErrorClass(error.message || "Blog media upload failed", 400);
    }
  }

  // Delete blog media
  async deleteBlogMedia(filePath) {
    try {
      const { error } = await storageClient
        .from(this.blogBucket)
        .remove([filePath]);

      if (error) {
        console.error("Error deleting blog media:", error);
      }
    } catch (error) {
      console.error("Error deleting blog media:", error);
    }
  }

  // Upload career CV (PDF only)
  async uploadCareerCv(file, applicantId = null) {
    try {
      this.validateCareerCv(file);

      const fileExt = file.originalname.split(".").pop();
      const timestamp = Date.now();
      const safeBase = (file.originalname || "cv")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const fileName = applicantId
        ? `${applicantId}-${timestamp}.${fileExt}`
        : `${safeBase}-${timestamp}.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      const { error } = await storageClient
        .from(this.careerBucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new ErrorClass(`Upload failed: ${error.message}`, 400);
      }

      const { data: urlData } = storageClient
        .from(this.careerBucket)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
      };
    } catch (error) {
      throw new ErrorClass(error.message || "Career CV upload failed", 400);
    }
  }

  // Validate CV file (PDF only, <= 10MB)
  validateCareerCv(file) {
    const allowedType = "application/pdf";
    const maxSize = 10 * 1024 * 1024;

    if (file.mimetype !== allowedType) {
      throw new ErrorClass("Only PDF files are allowed for CV upload", 400);
    }

    if (!file.originalname.toLowerCase().endsWith(".pdf")) {
      throw new ErrorClass("CV file must have a .pdf extension", 400);
    }

    if (file.size > maxSize) {
      throw new ErrorClass("CV size must be less than 10MB", 400);
    }

    return true;
  }
  // Validate file type and size for profile photos
  validateProfilePhoto(file) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ErrorClass("Only JPEG, PNG, and WebP images are allowed", 400);
    }

    if (file.size > maxSize) {
      throw new ErrorClass("File size must be less than 5MB", 400);
    }

    return true;
  }

  // Validate file type and size for blog media
  validateBlogMedia(file) {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    const maxImageSize = 10 * 1024 * 1024; // 10MB for images
    const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ErrorClass(
        "Only JPEG, PNG, WebP, GIF images and MP4, WebM, OGG videos are allowed",
        400
      );
    }

    // Check size based on file type
    if (allowedImageTypes.includes(file.mimetype) && file.size > maxImageSize) {
      throw new ErrorClass("Image size must be less than 10MB", 400);
    }

    if (allowedVideoTypes.includes(file.mimetype) && file.size > maxVideoSize) {
      throw new ErrorClass("Video size must be less than 100MB", 400);
    }

    return true;
  }
}
