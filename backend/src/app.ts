import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/globalErrorHandler';

// استيراد الـ Routes
import authRoutes from './routes/authRoute';
import projectRoutes from './routes/projectRoute';
import scanRoutes from './routes/scanRoute';
import dashboardRoute from './routes/dashboardRoute';

dotenv.config();

const app = express();

// --- 1. Middlewares الأساسية (بالترتيب الصحيح) ---
app.use(helmet()); // للحماية
app.use(cors({
  origin: ['http://localhost:5173', 'https://sentinelai-2ra7.onrender.com'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json()); // ضروري لقراءة الـ Body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // لقراءة الـ Cookies

// --- 2. روابط الـ Health Check (دائماً في البداية لتجنب التعليق) ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('Server is healthy and running perfectly');
});

// لضمان رؤية الـ DATABASE_URL في الـ Logs عند التشغيل
console.log("Database URL is defined:", !!process.env.DATABASE_URL);

// --- 3. تعريف الـ Routes ---
// ملاحظة: الـ Dashboard والـ Auth والـ Projects كلها هون
app.use('/api/dashboard', dashboardRoute);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scan', scanRoutes);

// --- 4. معالجة الروابط غير الموجودة (404) ---
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --- 5. الـ Global Error Handler (المكان الوحيد الصح: آاااخر الملف) ---
// لازم يكون بعد كل الـ Routes عشان يمسك أي Error بوقع فوقه
app.use(errorHandler);

// --- 6. إعدادات السيرفر والـ Timeout ---
const PORT = process.env.PORT || 5000;
const server = app.listen(5000, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// زيادة الـ Timeout للعمليات الطويلة (مثل الـ AI Scans)
server.timeout = 300000; // 5 دقائق

export default app;