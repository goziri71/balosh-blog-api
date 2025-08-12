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
