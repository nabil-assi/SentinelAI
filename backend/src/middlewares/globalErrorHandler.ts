import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error]: ${err.stack}`);

  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
    },
  });
};