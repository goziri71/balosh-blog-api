import express from "express";
import cors from "cors";
import { Config } from "./src/config/index.js";
import { connectDB } from "./src/database/index.js";
import { ErrorHandlerMiddleware } from "./src/middleware/errorHandler.js";
import authRouter from "./src/routes/auth.js";
import blogRouter from "./src/routes/blogs.js";
import categoryRouter from "./src/routes/categories.js";

const app = express();
const port = Config.PORT;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/categories", categoryRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Blog API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use(ErrorHandlerMiddleware);

(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  } catch (error) {
    console.log(error.message);
  }
})();
