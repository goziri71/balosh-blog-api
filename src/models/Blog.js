import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
      default: "",
    },
    featuredImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishDate: {
      type: Date,
      default: null,
    },
    // SEO Fields
    metaTitle: {
      type: String,
      maxlength: 60,
      default: "",
    },
    metaDescription: {
      type: String,
      maxlength: 160,
      default: "",
    },
    metaKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    // Engagement
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readTime: {
      type: Number,
      default: 5, // in minutes
    },
    // Publishing
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
blogSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();

  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Calculate read time (rough estimate: 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  next();
});

// Virtual for like count
blogSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for excerpt if not provided
blogSchema.virtual("autoExcerpt").get(function () {
  if (this.excerpt) return this.excerpt;
  return (
    this.content.substring(0, 300) + (this.content.length > 300 ? "..." : "")
  );
});

// Ensure virtual fields are serialized
blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

// Indexes for better performance
blogSchema.index({ status: 1, publishDate: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ "likes.user": 1 });

export default mongoose.model("Blog", blogSchema);
