import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key") as { id: string, email: string };
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message); 
    return res.status(403).json({ message: "Invalid Token", error: error.message });
  }
};