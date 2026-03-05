import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/globalErrorHandler.ts';
dotenv.config();

import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';


import authRoutes from './routes/authRoute.ts';
import projectRoutes from './routes/projectRoute.ts';
import scanRoutes from './routes/scanRoute.ts';


const app = express();


// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(cookieParser());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 طلبات فقط
  message: 'Too many scans, please try again later'
});

// app.use('/api/scan', limiter); // هذا يمنع الطلب فوراً
// Slow down المتطفلين
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  delayAfter: 3,            // السماح بـ 3 طلبات بدون تأخير
  delayMs: () => 500,        // 500ms تأخير إضافي لكل طلب بعد الـ 3 طلبات (الصيغة الجديدة)
});
// Routes

console.log("Database URL is:", process.env.DATABASE_URL);
// app.use('/api/scan', limiter, speedLimiter);
// app.use('/api/scan', speedLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scan', scanRoutes);


app.get('/health', (req: Request, res: Response) => {
  res.send('Server is healthy and runnig perfectly');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});

// اجعل الوقت 5 دقائق (300 ثانية) لتسمح للـ Loop والـ AI بالعمل
server.timeout = 300000;
export default app;