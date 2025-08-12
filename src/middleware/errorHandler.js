export const ErrorHandlerMiddleware = (error, req, res, next) => {
  console.error("Global error:", error);

  // Handle custom ErrorClass
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: false,
      message: error.message,
    });
  }

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      status: false,
      message: "Validation error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  // Handle Mongoose cast errors
  if (error.name === "CastError") {
    return res.status(400).json({
      status: false,
      message: "Invalid ID format",
    });
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      status: false,
      message: `${field} already exists`,
    });
  }

  // Default error
  res.status(500).json({
    status: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
};
