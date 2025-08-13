import Blog from "../models/Blog.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { UploadService } from "../service/upload.service.js";
import { TryCatchFunction } from "../utils/tryCatch/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";

const uploadService = new UploadService();

// Create new blog
export const createBlog = TryCatchFunction(async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      throw new ErrorClass("Blog title is required", 400);
    }

    if (title.trim().length > 200) {
      throw new ErrorClass("Blog title must be less than 200 characters", 400);
    }

    if (!content || content.trim() === "") {
      throw new ErrorClass("Blog content is required", 400);
    }

    if (content.trim().length < 10) {
      throw new ErrorClass(
        "Blog content must be at least 10 characters long",
        400
      );
    }

    if (!category) {
      throw new ErrorClass("Category is required", 400);
    }

    // Validate category ID format
    if (!category.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ErrorClass("Invalid category ID format", 400);
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new ErrorClass("Category not found", 400);
    }

    // Validate status if provided
    if (status && !["draft", "published"].includes(status)) {
      throw new ErrorClass("Status must be either 'draft' or 'published'", 400);
    }

    // Validate excerpt length if provided
    if (excerpt && excerpt.length > 300) {
      throw new ErrorClass("Excerpt must be less than 300 characters", 400);
    }

    // Generate unique slug from title
    let baseSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;

    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Process tags (convert comma-separated string to array)
    let tagsArray = [];
    if (tags) {
      if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    // Handle featured image upload if file is provided
    let featuredImageUrl = "";
    if (req.file) {
      // Validate the uploaded file
      uploadService.validateBlogMedia(req.file);

      // Upload to Supabase
      const uploadResult = await uploadService.uploadBlogMedia(
        req.file,
        req.user
      );
      featuredImageUrl = uploadResult.url;
    }

    // Set publish date if status is published
    const publishDate = status === "published" ? new Date() : null;

    const blog = new Blog({
      title: title.trim(),
      slug: slug,
      content: content,
      excerpt: excerpt || "",
      featuredImage: featuredImageUrl,
      category: category,
      tags: tagsArray,
      status: status || "draft",
      publishDate: publishDate,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt || "",
      author: req.user, // Fixed: use req.user directly (it's the ID)
    });

    await blog.save();

    // Populate author and category details
    await blog.populate([
      { path: "author", select: "username firstName lastName profilePhoto" },
      { path: "category", select: "name icon" }, // Fixed: use icon instead of color
    ]);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: { blog },
    });
  } catch (error) {
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      throw new ErrorClass(
        `${field} '${value}' already exists. Please choose a different ${
          field === "slug" ? "title" : field
        }.`,
        400
      );
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      throw new ErrorClass(`Validation failed: ${messages.join(", ")}`, 400);
    }

    // Handle invalid ObjectId errors
    if (error.name === "CastError") {
      throw new ErrorClass("Invalid ID format provided", 400);
    }

    // Handle file upload errors
    if (
      error.message?.includes("Upload failed") ||
      error.message?.includes("File")
    ) {
      throw new ErrorClass(error.message, 400);
    }

    // Re-throw ErrorClass instances
    if (error instanceof ErrorClass) {
      throw error;
    }

    // Handle any other errors
    console.error("Unexpected error in createBlog:", error);
    throw new ErrorClass(
      "An unexpected error occurred while creating the blog",
      500
    );
  }
});

// Get all blogs with filtering and pagination
export const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      author,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const blogs = await Blog.find(query)
      .populate([
        { path: "author", select: "username firstName lastName profilePhoto" },
        { path: "category", select: "name icon" },
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBlogs: total,
          hasNext: skip + blogs.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// Get single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate([
      {
        path: "author",
        select: "username firstName lastName profilePhoto bio",
      },
      { path: "category", select: "name icon description" },
    ]);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Anyone can view any blog (simplified)

    // Increment view count for published blogs
    if (blog.status === "published") {
      blog.views += 1;
      await blog.save();
    }

    res.json({
      success: true,
      data: { blog },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// Update blog
export const updateBlog = TryCatchFunction(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate blog ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ErrorClass("Invalid blog ID format", 400);
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new ErrorClass("Blog not found", 404);
    }

    // Prepare update data
    const updateData = {};

    // Handle title update with slug regeneration
    if (title && title.trim() !== blog.title) {
      if (title.trim().length > 200) {
        throw new ErrorClass(
          "Blog title must be less than 200 characters",
          400
        );
      }

      // Generate new unique slug
      let baseSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      let newSlug = baseSlug;
      let counter = 1;

      while (await Blog.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.title = title.trim();
      updateData.slug = newSlug;
    }

    // Handle content update
    if (content !== undefined) {
      if (!content || content.trim() === "") {
        throw new ErrorClass("Blog content is required", 400);
      }
      if (content.trim().length < 10) {
        throw new ErrorClass(
          "Blog content must be at least 10 characters long",
          400
        );
      }
      updateData.content = content;
    }

    // Handle excerpt update
    if (excerpt !== undefined) {
      if (excerpt && excerpt.length > 300) {
        throw new ErrorClass("Excerpt must be less than 300 characters", 400);
      }
      updateData.excerpt = excerpt;
    }

    // Handle category update
    if (category && category !== blog.category.toString()) {
      if (!category.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ErrorClass("Invalid category ID format", 400);
      }

      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        throw new ErrorClass("Category not found", 400);
      }
      updateData.category = category;
    }

    // Handle tags update
    if (tags !== undefined) {
      let tagsArray = [];
      if (tags) {
        if (typeof tags === "string") {
          tagsArray = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
        } else if (Array.isArray(tags)) {
          tagsArray = tags;
        }
      }
      updateData.tags = tagsArray;
    }

    // Handle status update
    if (status && status !== blog.status) {
      if (!["draft", "published"].includes(status)) {
        throw new ErrorClass(
          "Status must be either 'draft' or 'published'",
          400
        );
      }
      updateData.status = status;

      // Set publish date if changing to published
      if (status === "published" && blog.status !== "published") {
        updateData.publishDate = new Date();
      }
    }

    // Handle meta fields
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      updateData.metaDescription = metaDescription;

    // Handle featured image update
    if (req.file) {
      // Validate the uploaded file
      uploadService.validateBlogMedia(req.file);

      // Upload new image to Supabase
      const uploadResult = await uploadService.uploadBlogMedia(
        req.file,
        req.user,
        id
      );
      updateData.featuredImage = uploadResult.url;

      // Delete old image if it exists and is a Supabase URL
      if (blog.featuredImage && blog.featuredImage.includes("supabase")) {
        // Extract file path from URL to delete old image
        const urlParts = blog.featuredImage.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const oldPath = `blogs/${fileName}`;
        await uploadService.deleteBlogMedia(oldPath);
      }
    }

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "author", select: "username firstName lastName profilePhoto" },
      { path: "category", select: "name icon" },
    ]);

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: { blog: updatedBlog },
    });
  } catch (error) {
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      throw new ErrorClass(
        `${field} '${value}' already exists. Please choose a different ${
          field === "slug" ? "title" : field
        }.`,
        400
      );
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      throw new ErrorClass(`Validation failed: ${messages.join(", ")}`, 400);
    }

    // Handle invalid ObjectId errors
    if (error.name === "CastError") {
      throw new ErrorClass("Invalid ID format provided", 400);
    }

    // Handle file upload errors
    if (
      error.message?.includes("Upload failed") ||
      error.message?.includes("File")
    ) {
      throw new ErrorClass(error.message, 400);
    }

    // Re-throw ErrorClass instances
    if (error instanceof ErrorClass) {
      throw error;
    }

    // Handle any other errors
    console.error("Unexpected error in updateBlog:", error);
    throw new ErrorClass(
      "An unexpected error occurred while updating the blog",
      500
    );
  }
});

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Anyone with JWT can delete (simplified)

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};

// Toggle blog like
export const toggleLike = TryCatchFunction(async (req, res) => {
  const { id } = req.params;

  // Get user identifier (authenticated user ID or anonymous identifier)
  let userIdentifier;
  let isAuthenticated = false;

  // Check if user is authenticated
  if (req.user) {
    userIdentifier = req.user.toString();
    isAuthenticated = true;
  } else {
    // For anonymous users, use IP address + user agent as identifier
    const clientIP =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get("User-Agent") || "";
    userIdentifier = `anonymous_${Buffer.from(clientIP + userAgent)
      .toString("base64")
      .slice(0, 20)}`;
  }

  // Validate blog ID format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ErrorClass("Invalid blog ID format", 400);
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new ErrorClass("Blog not found", 404);
  }

  // Check if user/visitor already liked the blog
  const existingLikeIndex = blog.likes.findIndex(
    (like) => like.identifier === userIdentifier
  );

  let message;
  let isLiked;

  if (existingLikeIndex !== -1) {
    // Remove like
    blog.likes.splice(existingLikeIndex, 1);
    message = "Like removed";
    isLiked = false;
  } else {
    // Add like
    blog.likes.push({
      identifier: userIdentifier,
      isAuthenticated: isAuthenticated,
      user: isAuthenticated ? req.user : null,
      createdAt: new Date(),
    });
    message = "Blog liked";
    isLiked = true;
  }

  await blog.save();

  res.json({
    success: true,
    message: message,
    data: {
      likeCount: blog.likes.length,
      isLiked: isLiked,
    },
  });
});

// Get blog statistics
export const getBlogStats = async (req, res) => {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          draftBlogs: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
        },
      },
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || {} },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog statistics",
      error: error.message,
    });
  }
};
