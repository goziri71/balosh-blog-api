# 📚 Balosh Blog API Documentation

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

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "bio": "Updated bio",
  "username": "newusername"
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
        "featuredImage": "",
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
          "color": "#3B82F6"
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
      /* full blog object with author and category populated */
    }
  }
}
```

### Create Blog

**POST** `/blogs`

- **Requires:** Bearer token

**Body:**

```json
{
  "title": "My New Blog Post",
  "content": "This is the content of my blog post...",
  "excerpt": "Short description",
  "category": "64f1a2b3c4d5e6f7g8h9i0j2",
  "tags": ["javascript", "tutorial"],
  "status": "draft",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "metaKeywords": ["javascript", "tutorial"],
  "isFeatured": false,
  "allowComments": true
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "blog": {
      /* created blog object */
    }
  }
}
```

### Update Blog

**PUT** `/blogs/{id}`

- **Requires:** Bearer token

**Body:** (same as create, all fields optional)

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
        "color": "#3B82F6",
        "isActive": true,
        "order": 1,
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

### Create Category

**POST** `/categories`

- **Requires:** Bearer token

**Body:**

```json
{
  "name": "Technology",
  "description": "Tech related posts",
  "color": "#3B82F6",
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

## 🛠️ Frontend Integration

### Authentication Flow:

1. Store JWT token in localStorage/sessionStorage after login
2. Include token in all protected API calls
3. Redirect to login if you receive 401 responses
4. Refresh token before expiry (24 hours)

### Example Frontend Code:

```javascript
// Set token
localStorage.setItem("token", data.token);

// API call with token
fetch("/api/v1/blogs", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});
```
