import Category from "../models/Category.js";
import Blog from "../models/Blog.js";
import { TryCatchFunction } from "../utils/tryCatch/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";

// Create new category
export const createCategory = TryCatchFunction(async (req, res) => {
  const { name, description, icon, order } = req.body;

  if (!name || name.trim() === "") {
    throw new ErrorClass("Category name is required", 400);
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ErrorClass("Category with this name already exists", 400);
  }

  // Generate slug from name
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const category = new Category({
    name: name.trim(),
    slug: slug,
    description: description || "",
    icon: icon || 1,
    order: order || 0,
  });

  await category.save();

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
});

// Get all categories with blog counts
export const getCategories = TryCatchFunction(async (req, res) => {
  const { active } = req.query;

  let query = {};
  if (active === "true") {
    query.isActive = true;
  }

  const categories = await Category.find(query).sort({ order: 1, name: 1 });

  // Get blog count for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const blogCount = await Blog.countDocuments({
        category: category._id,
        status: "published", // Only count published blogs
      });

      return {
        ...category.toObject(),
        blogCount: blogCount,
      };
    })
  );

  res.json({
    success: true,
    data: { categories: categoriesWithCounts },
  });
});

// Get single category by ID with blog count
export const getCategoryById = TryCatchFunction(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ErrorClass("Category not found", 404);
  }

  // Get blog count for this category
  const blogCount = await Blog.countDocuments({
    category: category._id,
    status: "published", // Only count published blogs
  });

  const categoryWithCount = {
    ...category.toObject(),
    blogCount: blogCount,
  };

  res.json({
    success: true,
    data: { category: categoryWithCount },
  });
});

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, order, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if name is being changed and if it conflicts with existing
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, color, order, isActive },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      data: { category: updatedCategory },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has blogs (you might want to prevent deletion if it does)
    // This would require importing the Blog model and checking

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

// Toggle category active status
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: `Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling category status",
      error: error.message,
    });
  }
};

// Reorder categories
export const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category orders format",
      });
    }

    // Update each category's order
    const updatePromises = categoryOrders.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Fetch updated categories
    const categories = await Category.find().sort({ order: 1, name: 1 });

    res.json({
      success: true,
      message: "Categories reordered successfully",
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reordering categories",
      error: error.message,
    });
  }
};
