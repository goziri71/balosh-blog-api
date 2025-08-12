import Category from "../models/Category.js";

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, color, order } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      name,
      description: description || "",
      color: color || "#3B82F6",
      order: order || 0,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { active } = req.query;

    let query = {};
    if (active === "true") {
      query.isActive = true;
    }

    const categories = await Category.find(query).sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

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
