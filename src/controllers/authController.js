import User from "../models/User.js";
import { AuthService } from "../service/auth.service.js";
import { UploadService } from "../service/upload.service.js";
import { TryCatchFunction } from "../utils/tryCatch/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";
import { Config } from "../config/index.js";

const authService = new AuthService();
const uploadService = new UploadService();

// Register new user
export const register = TryCatchFunction(async (req, res) => {
  const { username, email, password, firstName, lastName, bio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ErrorClass("user already exists", 409);
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    bio: bio || "",
  });

  console.log("User created:", user);

  await user.save();

  // Generate token
  const token = await authService.signToken(user._id, Config.JWT_SECRET, "7d");

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: user.getPublicProfile(),
      token,
    },
  });
});

// Login user
export const login = TryCatchFunction(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorClass("user not found", 404);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ErrorClass("Invalid email or password", 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = await authService.signToken(user._id, Config.JWT_SECRET, "1d");

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: user.getPublicProfile(),
      token,
    },
  });
});

// Get current user profile
export const getProfile = TryCatchFunction(async (req, res) => {
  console.log("req.user:", req.user); // Debug log
  const user = await User.findById(req.user).select("-password");

  if (!user) {
    throw new ErrorClass("user profile not found", 404);
  }

  res.json({
    success: true,
    data: { user },
  });
});

// Update user profile
export const updateProfile = TryCatchFunction(async (req, res) => {
  const { firstName, lastName, bio, username } = req.body;
  const updateData = {};

  // Handle profile photo upload if file is provided
  if (req.file) {
    // Validate the uploaded file
    uploadService.validateProfilePhoto(req.file);

    // Get current user to check existing profile photo
    const currentUser = await User.findById(req.user);

    // Upload new profile photo
    const uploadResult = await uploadService.uploadProfilePhoto(
      req.file,
      req.user
    );
    updateData.profilePhoto = uploadResult.url;

    // Delete old profile photo if it exists
    if (
      currentUser.profilePhoto &&
      currentUser.profilePhoto.includes("supabase")
    ) {
      // Extract file path from URL to delete old photo
      const oldPath = currentUser.profilePhoto.split("/").slice(-2).join("/");
      await uploadService.deleteProfilePhoto(oldPath);
    }
  }

  // Only allow updating certain fields
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (bio !== undefined) updateData.bio = bio;

  // Check username uniqueness if changing
  if (username) {
    const currentUser = await User.findById(req.user);
    if (username !== currentUser.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new ErrorClass("Username already taken", 400);
      }
      updateData.username = username;
    }
  }

  const user = await User.findByIdAndUpdate(req.user, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};
