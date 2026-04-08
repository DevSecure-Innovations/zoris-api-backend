import type { 
	Request, 
	Response, 
	NextFunction 
} from "express";
import AppError from "../utils/appError";

/* DESC: Global Middleware to handle errors
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // fallback for unknown errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
