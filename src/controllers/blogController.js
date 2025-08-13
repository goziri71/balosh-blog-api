import Blog from "../models/Blog.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { UploadService } from "../service/upload.service.js";
import { TryCatchFunction } from "../utils/tryCatch/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";

const uploadService = new UploadService();

// Create new blog
export const createBlog = TryCatchFunction(async (req, res) => {
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

  if (!content || content.trim() === "") {
    throw new ErrorClass("Blog content is required", 400);
  }

  if (!category) {
    throw new ErrorClass("Category is required", 400);
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ErrorClass("Category not found", 400);
  }

  // Generate slug from title
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
});

// Get all blogs with filtering and pagination
export const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "published",
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
        { path: "category", select: "name color" },
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
      { path: "category", select: "name color description" },
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
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Anyone with JWT can edit (simplified)

    // Set publish date if status is changing to published
    if (updateData.status === "published" && blog.status !== "published") {
      updateData.publishDate = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "author", select: "username firstName lastName profilePhoto" },
      { path: "category", select: "name color" },
    ]);

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: { blog: updatedBlog },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

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
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if user already liked the blog
    const existingLike = blog.likes.find(
      (like) => like.user.toString() === userId.toString()
    );

    if (existingLike) {
      // Remove like
      blog.likes = blog.likes.filter(
        (like) => like.user.toString() !== userId.toString()
      );
    } else {
      // Add like
      blog.likes.push({ user: userId });
    }

    await blog.save();

    res.json({
      success: true,
      message: existingLike ? "Like removed" : "Blog liked",
      data: { likeCount: blog.likes.length, isLiked: !existingLike },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};

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
