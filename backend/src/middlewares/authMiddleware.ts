import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';

interface DecodedToken {
  id: string;
  email: string;
  deviceId?: string;
  iat?: number;
  exp?: number;
}
export interface AuthRequest extends Request {
  user?: DecodedToken;
  token?: string;
  deviceId?: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: "Access Denied: No Token Provided",
        code: "NO_TOKEN"
      });

    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret_key"
    ) as DecodedToken;

    const userExists = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });

    if (!userExists) {
      res.status(401).json({
        message: "User no longer exists",
        code: "USER_NOT_FOUND"
      })
    }

    req.user = {
      ...decoded,
      ...userExists
    };
    req.token = token;
    console.log(`✅ User ${decoded.email} accessed ${req.method} ${req.url}`);
    next();

  } catch (error: any) {
    console.error("❌ Auth Error:", error.message);

    // 7. معالجة أنواع الأخطاء المختلفة
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        message: "Invalid token",
        code: "INVALID_TOKEN"
      });
    }

    return res.status(500).json({
      message: "Authentication failed",
      code: "AUTH_FAILED"
    });
  }
}



// export const protect = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: "Access Denied: No Token Provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key") as { id: string, email: string };
//     (req as any).user = decoded;
//     next();
//   } catch (error: any) {
//     console.error("JWT Verification Error:", error.message); 
//     return res.status(403).json({ message: "Invalid Token", error: error.message });
//   }
// };