# 📚 Balosh Blog API Documentation

A modern blog API built with Node.js, Express, MongoDB, and Supabase for media storage.

## 🌟 Key Features

- **🔐 JWT Authentication** - Secure user authentication and authorization
- **📝 Rich Blog Management** - Create, read, update, delete blogs with HTML content
- **🏷️ Category System** - Organize blogs with icons and custom ordering
- **📁 Supabase Integration** - Seamless file uploads for profile photos and blog media
- **🎯 SEO Optimized** - Built-in meta tags and SEO-friendly URLs
- **📱 Mobile Ready** - Designed for modern frontend frameworks
- **🔍 Search & Filter** - Advanced blog filtering and pagination
- **❤️ Engagement** - Like system and view tracking

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

**Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Tech enthusiast and blogger"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Tech enthusiast and blogger",
      "profilePhoto": "",
      "lastLogin": "2023-09-01T10:00:00.000Z",
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

**POST** `/auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      /* user object */
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get User Profile

**GET** `/auth/profile`

- **Requires:** Bearer token

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      /* user object without password */
    }
  }
}
```

### Update Profile

**PUT** `/auth/profile`

- **Requires:** Bearer token

**Content-Type:** `multipart/form-data` (for photo uploads) or `application/json` (for text updates)

**Body (Form Data for Photo Upload):**

```
firstName: "John"
lastName: "Doe Updated"
bio: "Updated bio"
username: "newusername"
profilePhoto: [FILE] (image file - JPEG, PNG, WebP, max 5MB)
```

**Body (JSON for Text Only):**

```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "bio": "Updated bio",
  "username": "newusername"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe Updated",
      "bio": "Updated bio",
      "profilePhoto": "https://your-supabase-url/storage/v1/object/public/profile-photos/profiles/user-id-timestamp.jpg",
      "lastLogin": "2023-09-01T10:00:00.000Z",
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    }
  }
}
```

### Change Password

**PUT** `/auth/change-password`

- **Requires:** Bearer token

**Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

## 📝 Blog Endpoints

### Get All Blogs

**GET** `/blogs`

- **Public endpoint**

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): published|draft|archived (default: published)
- `category` (string): Category ID
- `author` (string): Author ID
- `search` (string): Search in title, content, tags
- `sortBy` (string): createdAt|title|views|likes (default: createdAt)
- `sortOrder` (string): desc|asc (default: desc)

**Example:**

```
GET /blogs?page=1&limit=5&search=nodejs&sortBy=createdAt&sortOrder=desc
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "title": "Getting Started with Node.js",
        "slug": "getting-started-with-node-js",
        "content": "Node.js is a powerful...",
        "excerpt": "Learn the basics...",
        "featuredImage": "https://your-supabase-url/storage/v1/object/public/blog-media/blogs/user-id-timestamp.jpg",
        "author": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j0",
          "username": "johndoe",
          "firstName": "John",
          "lastName": "Doe",
          "profilePhoto": ""
        },
        "category": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Technology",
          "icon": 1
        },
        "tags": ["nodejs", "javascript", "backend"],
        "status": "published",
        "publishDate": "2023-09-01T10:00:00.000Z",
        "metaTitle": "Node.js Tutorial",
        "metaDescription": "Complete guide...",
        "likes": [],
        "views": 150,
        "readTime": 5,
        "isFeatured": false,
        "allowComments": true,
        "likeCount": 0,
        "createdAt": "2023-09-01T10:00:00.000Z",
        "updatedAt": "2023-09-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalBlogs": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Blog by Slug

**GET** `/blogs/{slug}`

- **Public endpoint**

**Response (200):**

```json
{
  "success": true,
  "data": {
    "blog": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Getting Started with Node.js",
      "slug": "getting-started-with-node-js",
      "content": "<p>Node.js is a powerful <strong>JavaScript runtime</strong> that allows developers...</p>",
      "excerpt": "Learn the basics of Node.js development",
      "featuredImage": "https://your-supabase-url/storage/v1/object/public/blog-media/blogs/user-id-timestamp.jpg",
      "author": {
        "_id": "689b0ef7c2a558028a03eab9",
        "username": "zee71",
        "firstName": "goziri",
        "lastName": "odinaka",
        "profilePhoto": ""
      },
      "category": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Technology",
        "icon": 1
      },
      "tags": ["nodejs", "javascript", "backend"],
      "status": "published",
      "publishDate": "2025-08-12T10:00:00.000Z",
      "metaTitle": "Node.js Tutorial",
      "metaDescription": "Complete guide to Node.js development",
      "likes": [],
      "views": 150,
      "readTime": 5,
      "createdAt": "2025-08-12T10:00:00.000Z",
      "updatedAt": "2025-08-12T10:00:00.000Z"
    }
  }
}
```

### Create Blog

**POST** `/blogs`

- **Requires:** Bearer token

**Content-Type:** `multipart/form-data` (for file uploads) or `application/json` (text only)

**Body (Form Data with Featured Image):**

```
title: "My New Blog Post"
content: "<p>This is the <strong>HTML content</strong> from rich text editor.</p>"
excerpt: "Short description"
category: "64f1a2b3c4d5e6f7g8h9i0j2"
tags: "javascript, tutorial, nodejs"
status: "draft"
metaTitle: "SEO Title"
metaDescription: "SEO Description"
featuredImage: [FILE] (image/video - JPEG, PNG, WebP, GIF, MP4, WebM, OGG)
```

**Body (JSON - Text Only):**

```json
{
  "title": "My New Blog Post",
  "content": "<p>This is the <strong>HTML content</strong> from rich text editor.</p>",
  "excerpt": "Short description",
  "category": "64f1a2b3c4d5e6f7g8h9i0j2",
  "tags": "javascript, tutorial, nodejs",
  "status": "draft",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description"
}
```

**Validation Rules:**

- `title`: Required, max 200 characters
- `content`: Required, min 10 characters
- `category`: Required, valid MongoDB ObjectId
- `excerpt`: Optional, max 300 characters
- `status`: Optional, must be "draft" or "published"
- `tags`: Optional, comma-separated string
- `featuredImage`: Optional, images (max 10MB) or videos (max 100MB)

**Response (201):**

```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "blog": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "My New Blog Post",
      "slug": "my-new-blog-post",
      "content": "<p>This is the <strong>HTML content</strong> from rich text editor.</p>",
      "excerpt": "Short description",
      "featuredImage": "https://your-supabase-url/storage/v1/object/public/blog-media/blogs/user-id-timestamp.jpg",
      "author": {
        "_id": "689b0ef7c2a558028a03eab9",
        "username": "zee71",
        "firstName": "goziri",
        "lastName": "odinaka",
        "profilePhoto": ""
      },
      "category": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Technology",
        "icon": 1
      },
      "tags": ["javascript", "tutorial", "nodejs"],
      "status": "draft",
      "publishDate": null,
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Description",
      "likes": [],
      "views": 0,
      "readTime": 2,
      "createdAt": "2025-08-12T10:00:00.000Z",
      "updatedAt": "2025-08-12T10:00:00.000Z"
    }
  }
}
```

**Possible Errors:**

```json
// Duplicate title (slug conflict)
{
  "success": false,
  "message": "slug 'my-blog-post' already exists. Please choose a different title."
}

// Validation errors
{
  "success": false,
  "message": "Blog title must be less than 200 characters"
}

// Invalid category
{
  "success": false,
  "message": "Category not found"
}

// File upload errors
{
  "success": false,
  "message": "Image size must be less than 10MB"
}
```

### Update Blog

**PUT** `/blogs/{id}`

- **Requires:** Bearer token

**Content-Type:** `multipart/form-data` (for file uploads) or `application/json` (text only)

**Body (Form Data with Featured Image):**

```
title: "Updated Blog Title"
content: "<p>Updated <strong>HTML content</strong></p>"
excerpt: "Updated description"
category: "64f1a2b3c4d5e6f7g8h9i0j2"
tags: "updated, tags, list"
status: "published"
metaTitle: "Updated SEO Title"
metaDescription: "Updated SEO Description"
featuredImage: [FILE] (optional - new image/video)
```

**Body (JSON - Text Only):**

```json
{
  "title": "Updated Blog Title",
  "content": "<p>Updated <strong>HTML content</strong></p>",
  "excerpt": "Updated description",
  "category": "64f1a2b3c4d5e6f7g8h9i0j2",
  "tags": "updated, tags, list",
  "status": "published",
  "metaTitle": "Updated SEO Title",
  "metaDescription": "Updated SEO Description"
}
```

**Note:** All fields are optional. Only provide fields you want to update.

**Features:**

- **Smart Image Handling**: When uploading a new featured image, the old image is automatically deleted from Supabase
- **Unique Slug Generation**: If title is updated, a new unique slug is generated automatically
- **Selective Updates**: Only provided fields are updated, others remain unchanged
- **Validation**: Same validation rules as create blog apply
- **Auto-publish Date**: If status changes from draft to published, publishDate is set automatically

### Delete Blog

**DELETE** `/blogs/{id}`

- **Requires:** Bearer token

### Like/Unlike Blog

**POST** `/blogs/{id}/like`

- **Requires:** Bearer token

**Response (200):**

```json
{
  "success": true,
  "message": "Blog liked", // or "Like removed"
  "data": {
    "likeCount": 5,
    "isLiked": true
  }
}
```

### Get Blog Statistics

**GET** `/blogs/stats`

- **Public endpoint**

**Response (200):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalBlogs": 25,
      "publishedBlogs": 20,
      "draftBlogs": 5,
      "totalViews": 1500,
      "totalLikes": 120
    }
  }
}
```

---

## 🏷️ Category Endpoints

### Get All Categories

**GET** `/categories`

- **Public endpoint**

**Query Parameters:**

- `active` (boolean): Filter by active status

**Features:**

- Returns all categories with their blog counts
- Only counts **published blogs** (not drafts)
- Sorted by `order` then `name`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Technology",
        "slug": "technology",
        "description": "Tech related posts",
        "icon": 1,
        "isActive": true,
        "order": 1,
        "blogCount": 15,
        "createdAt": "2023-09-01T10:00:00.000Z",
        "updatedAt": "2023-09-01T10:00:00.000Z"
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Design",
        "slug": "design",
        "description": "Design related posts",
        "icon": 2,
        "isActive": true,
        "order": 2,
        "blogCount": 8,
        "createdAt": "2023-09-01T10:00:00.000Z",
        "updatedAt": "2023-09-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Category by ID

**GET** `/categories/{id}`

- **Public endpoint**

**Response (200):**

```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Technology",
      "slug": "technology",
      "description": "Tech related posts",
      "icon": 1,
      "isActive": true,
      "order": 1,
      "blogCount": 15,
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    }
  }
}
```

### Create Category

**POST** `/categories`

- **Requires:** Bearer token

**Body:**

```json
{
  "name": "Technology",
  "description": "Tech related posts",
  "icon": 1,
  "order": 1
}
```

### Update Category

**PUT** `/categories/{id}`

- **Requires:** Bearer token

### Delete Category

**DELETE** `/categories/{id}`

- **Requires:** Bearer token

### Toggle Category Status

**PUT** `/categories/{id}/toggle`

- **Requires:** Bearer token

### Reorder Categories

**PUT** `/categories/reorder`

- **Requires:** Bearer token

**Body:**

```json
{
  "categoryOrders": [
    { "id": "64f1a2b3c4d5e6f7g8h9i0j2", "order": 1 },
    { "id": "64f1a2b3c4d5e6f7g8h9i0j3", "order": 2 }
  ]
}
```

---

## 🔍 Utility Endpoints

### Health Check

**GET** `/health`

- **Public endpoint**

**Response (200):**

```json
{
  "success": true,
  "message": "Blog API is running",
  "timestamp": "2023-09-01T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "status": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

**Example Error:**

```json
{
  "status": false,
  "message": "Email already registered"
}
```

---

## 🚀 Getting Started

1. **Register a user** via `/auth/register`
2. **Login** via `/auth/login` to get JWT token
3. **Use the token** in Authorization header for protected endpoints
4. **Create categories** before creating blogs
5. **Create blogs** and start building your blog platform!

---

## 📋 Postman Collection

Import this collection for easy testing: [Coming Soon]

## 📁 File Upload & Media Management

### Supabase Integration

This API uses Supabase for file storage with two main buckets:

- **`profile-photos`** - User profile pictures
- **`blog-media`** - Blog featured images and videos

### File Upload Limits

**Profile Photos:**

- **Types:** JPEG, PNG, WebP
- **Size:** Max 5MB

**Blog Media:**

- **Images:** JPEG, PNG, WebP, GIF (Max 10MB)
- **Videos:** MP4, WebM, OGG (Max 100MB)

### File URLs

All uploaded files return Supabase public URLs:

```
https://your-project-id.supabase.co/storage/v1/object/public/bucket-name/path/filename.ext
```

---

## 🛠️ Frontend Integration

### Authentication Flow:

1. Store JWT token in localStorage/sessionStorage after login
2. Include token in all protected API calls
3. Redirect to login if you receive 401 responses
4. Refresh token before expiry (24 hours)

### File Upload Examples:

**Profile Photo Update:**

```javascript
const formData = new FormData();
formData.append("firstName", "John");
formData.append("lastName", "Doe");
formData.append("profilePhoto", fileInput.files[0]);

fetch("/api/v1/auth/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    // Don't set Content-Type for FormData
  },
  body: formData,
});
```

**Blog Creation with Featured Image:**

```javascript
const formData = new FormData();
formData.append("title", "My Blog Post");
formData.append("content", "<p>Rich HTML content</p>");
formData.append("category", categoryId);
formData.append("tags", "tag1, tag2, tag3");
formData.append("status", "published");
formData.append("featuredImage", imageFile);

fetch("/api/v1/blogs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### API Call Examples:

```javascript
// Set token
localStorage.setItem("token", data.token);

// Text-only API call
fetch("/api/v1/blogs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "My Blog",
    content: "<p>HTML content</p>",
    category: "category_id",
  }),
});
```
