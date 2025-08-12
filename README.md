# 🚀 Company Blog Backend API

A comprehensive Node.js/Express backend for a company blog system with user authentication, blog management, categories, and SEO features.

## ✨ Features

- **🔐 User Authentication & Authorization**

  - User registration and login with JWT
  - Role-based access control (Admin, Editor, Author)
  - Profile management with photo uploads
  - Password change functionality

- **📝 Blog Management**

  - Create, read, update, delete blogs
  - Draft/Published/Archived status
  - Featured blog posts
  - SEO meta fields (title, description, keywords)
  - Blog categories and tags
  - Like system and view tracking
  - Read time calculation

- **🏷️ Category Management**

  - Create and manage blog categories
  - Category ordering and colors
  - Active/inactive status toggle

- **📁 File Uploads**

  - Profile photo uploads
  - Blog featured images
  - Multer middleware with file validation
  - Organized upload directories

- **🔍 Advanced Features**
  - Search functionality across blogs
  - Pagination and filtering
  - Blog statistics and analytics
  - Role-based permissions

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd balosh-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/balosh-blog?retryWrites=true

   # Server Configuration
   PORT=5000

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # Environment
   NODE_ENV=development
   ```

4. **Start the server**

   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Base URL: `http://localhost:5000/api/v1`

### 🔐 Authentication Routes

| Method | Endpoint                | Description          | Auth Required |
| ------ | ----------------------- | -------------------- | ------------- |
| `POST` | `/auth/register`        | User registration    | ❌            |
| `POST` | `/auth/login`           | User login           | ❌            |
| `GET`  | `/auth/profile`         | Get user profile     | ✅            |
| `PUT`  | `/auth/profile`         | Update user profile  | ✅            |
| `PUT`  | `/auth/profile/photo`   | Update profile photo | ✅            |
| `PUT`  | `/auth/change-password` | Change password      | ✅            |

### 📝 Blog Routes

| Method   | Endpoint          | Description                  | Auth Required |
| -------- | ----------------- | ---------------------------- | ------------- |
| `GET`    | `/blogs`          | Get all blogs (with filters) | ❌            |
| `GET`    | `/blogs/:slug`    | Get blog by slug             | ❌            |
| `POST`   | `/blogs`          | Create new blog              | ✅ (Author+)  |
| `PUT`    | `/blogs/:id`      | Update blog                  | ✅ (Author+)  |
| `DELETE` | `/blogs/:id`      | Delete blog                  | ✅ (Author+)  |
| `POST`   | `/blogs/:id/like` | Toggle blog like             | ✅            |
| `GET`    | `/blogs/stats`    | Get blog statistics          | ❌            |

### 🏷️ Category Routes

| Method   | Endpoint                 | Description            | Auth Required |
| -------- | ------------------------ | ---------------------- | ------------- |
| `GET`    | `/categories`            | Get all categories     | ❌            |
| `GET`    | `/categories/:id`        | Get category by ID     | ❌            |
| `POST`   | `/categories`            | Create category        | ✅ (Editor+)  |
| `PUT`    | `/categories/:id`        | Update category        | ✅ (Editor+)  |
| `DELETE` | `/categories/:id`        | Delete category        | ✅ (Editor+)  |
| `PUT`    | `/categories/:id/toggle` | Toggle category status | ✅ (Editor+)  |
| `PUT`    | `/categories/reorder`    | Reorder categories     | ✅ (Editor+)  |

### 🔍 Utility Routes

| Method | Endpoint  | Description  | Auth Required |
| ------ | --------- | ------------ | ------------- |
| `GET`  | `/health` | Health check | ❌            |

## 📊 Request/Response Examples

### User Registration

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Tech enthusiast and blogger"
}
```

### Create Blog

```bash
POST /api/v1/blogs
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Getting Started with Node.js",
  "content": "Node.js is a powerful JavaScript runtime...",
  "excerpt": "Learn the basics of Node.js development",
  "category": "64f1a2b3c4d5e6f7g8h9i0j1",
  "tags": ["nodejs", "javascript", "backend"],
  "status": "draft",
  "metaTitle": "Node.js Tutorial for Beginners",
  "metaDescription": "Complete guide to getting started with Node.js",
  "isFeatured": false
}
```

### Get Blogs with Filters

```bash
GET /api/v1/blogs?page=1&limit=10&status=published&category=64f1a2b3c4d5e6f7g8h9i0j1&search=nodejs
```

## 🔐 Authentication

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Admin**: Full access to all features
- **Editor**: Can manage blogs and categories
- **Author**: Can create and manage their own blogs

## 📁 File Uploads

### Profile Photo

- **Field name**: `profilePhoto`
- **Accepted formats**: JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Upload path**: `/uploads/profiles/`

### Blog Images

- **Field name**: `blogImage`
- **Accepted formats**: JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Upload path**: `/uploads/blogs/`

## 🚀 Getting Started

1. **Start MongoDB** (local or Atlas)
2. **Set up environment variables**
3. **Install dependencies**: `npm install`
4. **Start server**: `npm run dev`
5. **Test endpoints** using Postman or similar tool

## 📈 Blog Statuses

- **Draft**: Work in progress, not visible to public
- **Published**: Live and visible to all users
- **Archived**: Hidden from public but preserved

## 🔍 Search & Filtering

Blogs can be filtered by:

- Status (draft/published/archived)
- Category
- Author
- Search terms (title, content, tags)
- Pagination (page, limit)
- Sorting (createdAt, title, views, likes)

## 📊 Statistics

The API provides blog statistics including:

- Total blogs count
- Published vs draft counts
- Total views
- Total likes

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## 🧪 Testing

Test the API endpoints using:

- **Postman** or **Insomnia**
- **cURL** commands
- **Frontend application**

## 📝 Environment Variables

| Variable      | Description               | Required | Default     |
| ------------- | ------------------------- | -------- | ----------- |
| `MONGODB_URI` | MongoDB connection string | ✅       | -           |
| `PORT`        | Server port               | ❌       | 5000        |
| `JWT_SECRET`  | JWT signing secret        | ✅       | -           |
| `NODE_ENV`    | Environment mode          | ❌       | development |

## 🚀 Deployment

1. **Set production environment variables**
2. **Build and start**: `npm start`
3. **Use PM2 or similar process manager**
4. **Set up reverse proxy (Nginx)**
5. **Configure SSL certificates**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Happy Blogging! 🎉**
