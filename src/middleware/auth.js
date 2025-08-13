import { AuthService } from "../service/auth.service.js";
import { Config } from "../config/index.js";
import { ErrorClass } from "../utils/errorClass/index.js";

const authService = new AuthService();

export const authorize = async (req, res, next) => {
  try {
    const authToken = req.get("Authorization")?.split(" ")[1];
    const verifiedToken = await authService.verifyToken(
      authToken,
      Config.JWT_SECRET
    );
    console.log(verifiedToken);
    req.user = verifiedToken.id;
    next();
  } catch (error) {
    next(new ErrorClass(error.message, 401));
  }
};

// Optional auth middleware - doesn't throw error if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authToken = req.get("Authorization")?.split(" ")[1];
    if (authToken) {
      const verifiedToken = await authService.verifyToken(
        authToken,
        Config.JWT_SECRET
      );
      req.user = verifiedToken.id;
    }
    // Always continue, whether authenticated or not
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};
